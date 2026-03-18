'use client'

import React, { useEffect, useState } from 'react'
import * as fabric from 'fabric'
import { Check, X } from 'lucide-react'
import type { ArtboardFrame } from '../../../../lib/store/canvasStore'
import { useCanvasStore } from '../../../../lib/store/canvasStore'
import { Badge } from '@/components/ui/badge'
import { Screen } from "../../../../lib/store/canvasStore"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import extractCanvasData from '@/lib/render/extractCanvasData'
import GenerateButton from '@/components/ui/generateButton'
import renderFromAI from '@/lib/canvas/RenderAiPatterns'
import { AIScreen } from '../../../../lib/type'
import Grainient from '@/components/ui/Aizone/Grainient'
import { useRealtimeGeneration } from '@/hooks/useRealtimeGeneration'
import {
    defaultSaasPreset,
    darkCinematicPreset,
    glassNeonPreset,
    minimalSaasPreset,
    softPastelPreset
} from '@/lib/design-systems/presets'
import { TIMEOUT } from 'dns'

type WireframeElement = {
    type: string
    [key: string]: any
}


const FramesOverlay = ({ frame }: any) => {
    const canvas = useCanvasStore((s) => s.canvas)
    const frames = useCanvasStore((s) => s.frames)
    const [, forceUpdate] = useState(0)
    const [loader, setloader] = useState(false)
    const [userPrompt, setPrompt] = useState('')
    const idMap = React.useRef<Record<string, string>>({});
    const [isDrawingZone, setIsDrawingZone] = useState(false);
    const [activeGhostZone, setActiveGhostZone] = useState<fabric.Rect | null>(null);
    const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
    const normalizedBadge = String(frame.badge || '').toLowerCase();
    const isSourceSketchFrame = normalizedBadge === 'sketch' || normalizedBadge === 'idea';
    const pairedAiFrame = isSourceSketchFrame
        ? frames.find((f) => f.id === `${frame.id}_ai` || f.linkedFrameId === frame.id)
        : null;
    const realtimeFrameId = pairedAiFrame?.id ?? `${frame.id}_ai`;
    const FRAME_GAP = 100;
    const SECTION_PADDING = 60;
    const SECTION_TOP_MARGIN = 70;

    // Realtime control refs (kept outside render loop).
    // Debounce/snapshot refs keep timers stable across renders.
    // Debounce timer: batch rapid sketch events into one WS update.
    const realtimeDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null); //  stores the debounce timer so we don’t send AI requests on every tiny sketch event. It waits briefly (400ms), then sends one combined update.
    // Periodic full snapshot sender for resync.
    const snapshotIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null); //stores the repeating interval timer (every ~3s) used to send periodic full snapshots for sync/recovery.
    // True while we are waiting on AI output for the latest sketch.
    const hasPendingRealtimeUpdateRef = React.useRef(false);
    // Last sketch timestamp; used to stop sending snapshots when idle.
    const lastSketchAtRef = React.useRef(0);

    // WebSocket realtime hook: opens WS, sends session.start, and exposes sendDelta/sendSnapshot.
    const {
        state: realtimeState,
        sendDelta, // this is the websockets helper (like something changed message)
        sendSnapshot,
    } = useRealtimeGeneration({
        frameId: realtimeFrameId,
        enabled: Boolean(canvas) && isSourceSketchFrame,
    });


    // preset map
    const presetMap = {
        default_saas: defaultSaasPreset,
        minimal_saas: minimalSaasPreset,
        glass_neon: glassNeonPreset,
        dark_cinematic: darkCinematicPreset,
        soft_pastel: softPastelPreset,
    };

    /* ------------------ UTILS ------------------ */
    function canvasToScreen(canvas: fabric.Canvas, x: number, y: number) {
        const vpt = canvas.viewportTransform!
        return {
            x: x * vpt[0] + vpt[4],
            y: y * vpt[3] + vpt[5],
        }
    }

    /* ------------------ Web Sockets ------------------*/

    // When the Web reloads , the servers and client side(frontend) are connected through web sockets
    useEffect(() => {
        if (!canvas) return

        const update = () => forceUpdate((n) => n + 1)

        canvas.on('mouse:wheel', update)
        canvas.on('object:moving', update)
        canvas.on('after:render', update)

        return () => {
            canvas.off('mouse:wheel', update)
            canvas.off('object:moving', update)
            canvas.off('after:render', update)
        }
    }, [canvas])

    // Reflect realtime transport health into AiZone frame status.
    useEffect(() => {
        if (!isSourceSketchFrame) return;
        if (realtimeState === 'error') {
            useCanvasStore.getState().updateFrame(realtimeFrameId, { status: 'error' });
        }
    }, [isSourceSketchFrame, realtimeFrameId, realtimeState]);

    // Debounced sketch-delta sender (path/create/modify/remove) for SketchZone only.
    useEffect(() => {
        if (!canvas || !isSourceSketchFrame) return;

        // The basic work for this piece of code is to just say that is the frame is empty or nah
        const isSketchContent = (obj: any) => {
            if (!obj) return false;
            if (obj.get?.('isFrame')
                || obj.get?.('data')?.isGhost
                || obj.get?.('placeholder')
            ) return false;

            const frameId = obj.get?.('frameId');
            if (frameId) return frameId === frame.id;
            // Fallback for early object events before frameId tagging completes.
            const center = obj.getCenterPoint?.();
            if (!center) return false;
            return (
                center.x >= frame.left &&
                center.x <= frame.left + frame.width &&
                center.y >= frame.top &&
                center.y <= frame.top + frame.height
            );
        };

        // Debounce wrapper: waits briefly, then sends one WS delta for recent sketch activity.
        const scheduleRealtimeDelta = (eventType: string) => {
            hasPendingRealtimeUpdateRef.current = true;
            lastSketchAtRef.current = Date.now();
            if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);

            // debounce in every 400 ms
            // Wait 400ms after last sketch event before sending to backend.
            realtimeDebounceRef.current = setTimeout(async () => {

                if (!canvas) return;
                const sketchObjects = canvas.getObjects().filter((obj: any) => isSketchContent(obj)); //got the state of the objecs
                const sketchObjectCount = sketchObjects.length; //if objects are there then just count the len

                if (sketchObjectCount < 2) {
                    useCanvasStore.getState().updateFrame(realtimeFrameId, { status: 'idle' });
                    hasPendingRealtimeUpdateRef.current = false;
                    return;
                }

                // after 2 objects are added then we will start streaming the AI
                useCanvasStore.getState().updateFrame(realtimeFrameId, { status: 'streaming' });

                const counts = sketchObjects.reduce(
                    (acc: any, obj: any) => {
                        const t = String(obj?.type || "").toLowerCase();
                        acc.total += 1;
                        if (t === "path") acc.paths += 1;
                        else if (t === "rect") acc.rects += 1;
                        else if (t === "circle") acc.circles += 1;
                        else if (t.includes("text")) acc.texts += 1;
                        else if (t === "image") acc.images += 1;
                        else acc.other += 1;
                        return acc;
                    },
                    { total: 0, paths: 0, rects: 0, circles: 0, texts: 0, images: 0, other: 0 }
                );

                const sketchSummary = {
                    counts,
                    hint:
                        counts.rects >= 3 ? "grid" :
                            counts.rects >= 1 ? "sections" :
                                counts.paths >= 5 ? "dense" : "light",
                };

                // Send a compact raster snapshot so the backend/AI can "see" the sketch.
                // Keep it small/low-quality to avoid flooding the WS.
                const imageBase64 = canvas.toDataURL({
                    format: "jpeg",
                    quality: 0.2,
                    multiplier: 0.2,
                });
                // Send a small change summary to backend over WS. means it tells the Sever that there is some changes
                const response = await sendDelta({
                    eventType,
                    sourceFrameId: frame.id,
                    targetFrameId: realtimeFrameId,
                    sketchObjectCount,
                    // Include prompt + image snapshot so AI has actual signal.
                    prompt: userPrompt?.trim() || "Generate a clean SaaS landing page wireframe",
                    imageBase64,
                    sketchSummary,
                    ts: Date.now(),
                });

                if (!response) {
                    useCanvasStore.getState().updateFrame(realtimeFrameId, { status: 'error' });
                    return;
                }

                if (response.generationError) {
                    console.error("[realtime-ai] generationError:", response.generationError);
                    useCanvasStore.getState().updateFrame(realtimeFrameId, { status: 'error' });
                    return;
                }

                if (response?.generatedDoc) {
                    console.log("[realtime-ai] got generatedDoc", {
                        ok: response.ok,
                        sections: Array.isArray((response.generatedDoc as any)?.sections)
                            ? (response.generatedDoc as any).sections.length
                            : 0,
                        firstElements: Array.isArray((response.generatedDoc as any)?.sections?.[0]?.elements)
                            ? (response.generatedDoc as any).sections[0].elements.length
                            : 0,
                    });
                    // Keep the latest generated document in Zustand as source-of-truth.
                    useCanvasStore.getState().setAiDoc(
                        realtimeFrameId,
                        response.generatedDoc as any
                    );


                    // Render a first visible preview directly from generated document.
                    const aiScreens = docToAIScreens(response.generatedDoc as any);
                    const doc = response.generatedDoc;
                    const styleKey = typeof doc?.style === "string" ? doc.style : "";
                    const preset = presetMap[styleKey as keyof typeof presetMap] ?? defaultSaasPreset;

                    if (aiScreens.length > 0) {
                        console.log("[realtime-ai] rendering screens", aiScreens.length);
                        const stale = canvas.getObjects().filter((o: any) =>
                            o.get?.("isAiGenerated") && o.get?.("frameId") === realtimeFrameId
                        );
                        stale.forEach((o) => canvas.remove(o));
                        renderFromAI(canvas, aiScreens, preset);
                    } else {
                        console.warn("[realtime-ai] docToAIScreens produced 0 screens");
                    }
                }

                // Mark AI output as ready once the patch arrives.
                if (response?.ok) {
                    useCanvasStore.getState().updateFrame(realtimeFrameId, {
                        status: 'ready',
                        lastPatchedAt: response.updatedAt ?? Date.now(),
                        version: response.version ?? 0,
                    });
                    hasPendingRealtimeUpdateRef.current = false;
                } else {
                    useCanvasStore.getState().updateFrame(realtimeFrameId, { status: 'error' });
                }
            }, 400);
        };


        const onPathCreated = (e: any) => {
            if (!isSketchContent(e?.path)) return;
            scheduleRealtimeDelta('path:created');
        };

        const onObjectAdded = (e: any) => {
            if (!isSketchContent(e?.target)) return;
            scheduleRealtimeDelta('object:added');
        };

        const onObjectModified = (e: any) => {
            if (!isSketchContent(e?.target)) return;
            scheduleRealtimeDelta('object:modified');
        };

        const onObjectRemoved = (e: any) => {
            if (!isSketchContent(e?.target)) return;
            scheduleRealtimeDelta('object:removed');
        };

        // Fabric events trigger realtime deltas.
        canvas.on('path:created', onPathCreated);
        canvas.on('object:added', onObjectAdded);
        canvas.on('object:modified', onObjectModified);
        canvas.on('object:removed', onObjectRemoved);

        return () => {
            canvas.off('path:created', onPathCreated);
            canvas.off('object:added', onObjectAdded);
            canvas.off('object:modified', onObjectModified);
            canvas.off('object:removed', onObjectRemoved);
            if (realtimeDebounceRef.current) {
                clearTimeout(realtimeDebounceRef.current);
                realtimeDebounceRef.current = null;
            }
        };
    }, [canvas, frame.id, isSourceSketchFrame, realtimeFrameId, sendDelta]);

    // Periodic snapshot reconciliation to reduce drift after many deltas.
    useEffect(() => {
        if (!canvas || !isSourceSketchFrame) return;

        // Snapshot timer: send full canvas state every ~3s while changes are pending.
        snapshotIntervalRef.current = setInterval(async () => {
            if (!hasPendingRealtimeUpdateRef.current) return;

            // Ts is to ccheck when the designer is basically stopped for like mode than 2 mins then the server will not send the snap shot to the ai
            // If user is idle for >2 minutes, stop sending snapshots and mark idle.
            if (Date.now() - lastSketchAtRef.current > 2 * 60 * 1000) {
                hasPendingRealtimeUpdateRef.current = false;
                useCanvasStore.getState().updateFrame(realtimeFrameId, { status: 'idle' });
                return;
            }
            // Send a full snapshot for resync (WS).
            const canvasData = extractCanvasData(canvas);
            await sendSnapshot({
                sourceFrameId: frame.id,
                targetFrameId: realtimeFrameId,
                canvasData,
                ts: Date.now(),
            });
        }, 3000);

        return () => {
            if (snapshotIntervalRef.current) {
                clearInterval(snapshotIntervalRef.current);
                snapshotIntervalRef.current = null;
            }
        };
    }, [canvas, frame.id, isSourceSketchFrame, realtimeFrameId, sendSnapshot]);


    /* ------------------ AI GENERATION ------------------ */

    type ScreenWithElements = Screen & {
        elements: {
            id: string
            role?: string
            col: number
            row: number
            span: number
            rowSpan: number
            blocks: any[]
        }[]
    }

    function aiToScreens(
        aiResponse: any,
        targetFrame: ArtboardFrame
    ): ScreenWithElements[] {
        if (!aiResponse?.screens?.length) return []

        return aiResponse.screens.map((s: any) => ({
            id: s.id ?? crypto.randomUUID(),
            name: s.name ?? "AI Screen",
            frame: {
                id: targetFrame.id,
                width: targetFrame.width,
                height: targetFrame.height,
            },
            elements: (s.elements || s.frames || []).map((el: any) => ({
                id: el.id ?? crypto.randomUUID(),
                role: el.role,
                col: el.col ?? 1,
                row: el.row ?? 1,
                span: el.span ?? 1,
                rowSpan: el.rowSpan ?? 1,
                blocks: el.blocks ?? []
            })),
        }))
    }

    function screenToAIScreen(screens: ScreenWithElements[]): AIScreen[] {
        return screens.map((s) => ({
            id: s.id,
            name: s.name,
            frameId: s.frame.id,
            elements: s.elements.map((el) => ({
                id: el.id,
                role: el.role,
                col: el.col,
                row: el.row,
                span: el.span,
                rowSpan: el.rowSpan,
                // The renderer requires the blocks array
                blocks: (el.blocks || []).map((block: any) => ({
                    id: block.id ?? crypto.randomUUID(),
                    // Ensure kind matches the specific union type required
                    kind: block.kind ?? "body_text",
                })),
                type: (el as any).type ?? 'block'
            }))
        }))
    }

    function docToAIScreens(doc: any): AIScreen[] {
        if (!doc?.frameId || !Array.isArray(doc.sections)) return [];
        return doc.sections.map((section: any) => ({
            id: section.id ?? crypto.randomUUID(),
            name: section.name ?? "AI Screen",
            frameId: doc.frameId,
            elements: (section.elements || []).map((el: any) => ({
                id: el.id ?? crypto.randomUUID(),
                role: el.role,
                col: el.col ?? 1,
                row: el.row ?? 1,
                span: el.span ?? 1,
                rowSpan: el.rowSpan ?? 1,
                blocks:

                    el.role === "dominant"
                        ? [
                            { id: `${el.id ?? crypto.randomUUID()}_t`, kind: "title_text" },
                            { id: `${el.id ?? crypto.randomUUID()}_b`, kind: "body_text" },
                            { id: `${el.id ?? crypto.randomUUID()}_a`, kind: "primary_action" },
                            { id: `${el.id ?? crypto.randomUUID()}_i`, kind: "content_image" },
                        ]
                        : [
                            { id: `${el.id ?? crypto.randomUUID()}_t`, kind: "title_text" },
                            { id: `${el.id ?? crypto.randomUUID()}_b`, kind: "body_text" },
                        ],
                type: el.type ?? "block",
            })),
        }))
    }


    const GenerateTypeSketch = async () => {
        if (!canvas) {
            console.error("Canvas not found")
            return
        }
        // Send a full snapshot for resync (WS).
        const canvasData = extractCanvasData(canvas)
        console.log('button is clicked')

        try {
            setloader(true)
            const parts: any[] = []

            const imageBase64 = canvas.toDataURL({
                format: "jpeg",
                quality: 0.05,
                multiplier: 0.05,
            })


            const ghostData = activeGhostZone ? {
                x: activeGhostZone.left - frame.left,
                y: activeGhostZone.top - frame.top,
                width: activeGhostZone.getScaledWidth(),
                height: activeGhostZone.getScaledHeight(),
            } : null;

            const response = await fetch("http://localhost:4000/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({
                    source: "sketch",
                    prompt: userPrompt.trim(),
                    imageBase64: imageBase64,
                    ghostZone: ghostData,
                    existingLayout: canvasData,
                    frame: {
                        width: frame.width,
                        height: frame.height,
                        type: frame.badge === "idea" ? "wireframe" : frame.badge,
                    },
                }),
            })

            if (!response.body) return
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                // Sometimes multiple JSON objects come in one chunk,
                // and sometimes one JSON object is split across two chunks.
                const lines = chunk.split("\n");

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

                    try {
                        const rawData = trimmedLine.replace("data: ", "");

                        if (rawData === "[DONE]") break;

                        const payload = JSON.parse(rawData);
                        console.log("FULL PAYLOAD RECEIVED:", payload);

                        // creation of frame
                        if (payload.type === "PLAN") {
                            console.log("Creating Ghost Frames:", payload.screens);
                            payload.screens.forEach((screenPlan: any) => {
                                const { frame: newFrame } = createNewFrame({
                                    canvas,
                                    sourceFrame: frame,
                                    badge: "AiZone",
                                    role: screenPlan.role || "suggestion"
                                });

                                idMap.current[screenPlan.id] = newFrame.id;
                            });
                        }

                        //Handle the ACTUAL CONTENT
                        if (payload.type === "SCREEN_DONE") {
                            const targetFrameId = idMap.current[payload.data.id];

                            if (!targetFrameId) {
                                console.warn("No pre-created frame found, rendering to current.");
                            }

                            const rawAiData = aiToScreens(
                                { screens: [payload.data] },
                                { ...frame, id: targetFrameId || frame.id }
                            );
                            const aiScreens = screenToAIScreen(rawAiData);

                            const doc = payload.data;
                            const styleKey = typeof doc?.style === "string" ? doc.style : "";
                            const preset = presetMap[styleKey as keyof typeof presetMap] ?? defaultSaasPreset;

                            renderFromAI(canvas, aiScreens, preset);
                            canvas.requestRenderAll();
                        }
                    } catch (e) {
                        console.error("Error parsing stream line:", trimmedLine, e);
                    }
                }
            }

        } catch (err) {
            console.error("Streaming failed", err)
        } finally {
            setloader(false)
        }
    }



    function createNewFrame({
        canvas,
        sourceFrame,
        badge,
        role = "refinement"
    }: {
        canvas: fabric.Canvas,
        sourceFrame: ArtboardFrame,
        badge: 'Sketch' | 'AiZone',
        role?: "refinement" | "suggestion"
    }) {
        const id = crypto.randomUUID();
        const frames = useCanvasStore.getState().frames;
        const GAP = FRAME_GAP;

        // Smart positioning: Find the furthest right edge
        const rightMost = frames.reduce((max, f) => Math.max(max, f.left + f.width), sourceFrame.left + sourceFrame.width);

        const frame: ArtboardFrame = {
            id,
            device: sourceFrame.device,
            badge,
            width: sourceFrame.width,
            height: sourceFrame.height,
            left: rightMost + GAP,
            top: sourceFrame.top,
            locked: badge === "AiZone",
            status: "idle",
            version: 0,
            lastPatchedAt: Date.now(),
        };

        const frameRect = new fabric.Rect({
            left: frame.left,
            top: frame.top,
            width: frame.width,
            height: frame.height,
            fill: role === "refinement" ? '#ffffff' : '#f8fafc',
            stroke: role === "refinement" ? '#6366f1' : '#cbd5e1',
            strokeWidth: 2,
            strokeDashArray: role === "suggestion" ? [10, 5] : [], // Dashed for suggestions
            opacity: role === "suggestion" ? 0.6 : 1,
            selectable: true,
        });

        frameRect.set('isFrame', true);
        frameRect.set('frameId', id);
        frameRect.set('role', role); // Store the role on the fabric object

        canvas.add(frameRect);
        useCanvasStore.getState().addFrame(frame);


        return { frame, frameId: id };
    }


    // ================= New COrresponding Ai frame ======================

    const DEFAULT_AI_Heading = {
        text: "Ai Zone",
        fontSize: 40,
        charSpacing: -100,
        fill: "#000",
        fontFamily: "arial",
    }

    const DEFAULT_AI_Text = {
        text: "Sketch to get results",
        fontSize: 65,
        charSpacing: -70,
        fill: "#000",
        fontFamily: "arial"
    }

    // Creates the ai zone
    const createAiZoneFrame = ({ sketchFrame }: {
        sketchFrame: ArtboardFrame,
    }) => {
        if (!canvas) return null;

        const aiId = `${sketchFrame.id}_ai`;
        const existing = canvas.getObjects().find(obj => (obj as any).frameId === aiId);
        const existingInStore = useCanvasStore.getState().frames.some((f) => f.id === aiId);

        if (existing || existingInStore) return aiId;

        const id = aiId; // Consistent ID mapping
        const GAP = FRAME_GAP;

        const aiFrameData: ArtboardFrame = {
            id,
            device: sketchFrame.device,
            badge: 'AiZone',
            width: sketchFrame.width,
            height: sketchFrame.height,
            left: sketchFrame.left + sketchFrame.width + GAP,
            top: sketchFrame.top,
            locked: true,
            status: "idle",
            version: 0,
            lastPatchedAt: Date.now(),
        };

        const rect = new fabric.Rect({
            left: aiFrameData.left,
            top: aiFrameData.top,
            width: aiFrameData.width,
            height: aiFrameData.height,
            fill: '#ffffff',
            stroke: '#6366f1',
            strokeWidth: 2,
            rx: 12,
            ry: 12,
            selectable: false,
        });

        rect.set({
            isFrame: true,
            frameId: id,
            badge: 'AiZone'
        } as any);

        canvas.add(rect);
        useCanvasStore.getState().addFrame(aiFrameData);
        idMap.current['primary_ai_output'] = id;

        return id;
    };

    // for loading the Ai frame
    useEffect(() => {
        if (!canvas || !frame) return;

        if (!isSourceSketchFrame) return;

        const aiFrameId = `${frame.id}_ai`;
        const hasAiZone = canvas.getObjects().some(
            (obj: any) => obj.get?.('isFrame') && obj.get?.('frameId') === aiFrameId
        );

        if (!hasAiZone) {
            createAiZoneFrame({ sketchFrame: frame });
        }
    }, [canvas, frame.id, isSourceSketchFrame]);

    useEffect(() => {
        if (!canvas || !isSourceSketchFrame) return;
        const aiFrameId = `${frame.id}_ai`;
        const staleAiPlaceholders = canvas.getObjects().filter((obj: any) => {
            return obj.get?.('frameId') === aiFrameId && obj.get?.('isPlaceholder');
        });
        if (!staleAiPlaceholders.length) return;
        staleAiPlaceholders.forEach((obj) => canvas.remove(obj));
        canvas.requestRenderAll();
    }, [canvas, frame.id, isSourceSketchFrame]);

    useEffect(() => {
        if (!canvas || !isSourceSketchFrame) return;

        const handleSelection = (e: any) => {
            const sel = e.selected?.[0]
            if (sel && sel.type === 'activeSelection') {
                sel.clipPath = undefined
            }
        };

        canvas.on('selection:created', handleSelection)
        canvas.on('selection:updated', handleSelection)

        return () => {
            canvas.off('selection:created', handleSelection)
            canvas.off('selection:updated', handleSelection)
        }
    }, [canvas])

    useEffect(() => {
        if (!canvas || !isSourceSketchFrame) return;

        const performCheck = () => {
            const objects = canvas.getObjects();
            const drawings = objects.filter((obj: any) => {
                return !obj.isFrame && !obj.data?.isGhost && !obj.get?.('isPlaceholder');
            });

            // ONLY update state if the value actually changed
            setIsCanvasEmpty((prev) => {
                const isEmpty = drawings.length === 0;
                return prev === isEmpty ? prev : isEmpty;
            });
        };

        canvas.on('object:added', performCheck);
        canvas.on('object:removed', performCheck);

        return () => {
            canvas.off('object:added', performCheck);
            canvas.off('object:removed', performCheck);
        };
    }, [canvas]);

    if (!canvas) return null

    const zoom = canvas.getZoom()
    const pos = canvasToScreen(canvas, frame.left, frame.top)

    const BAR_HEIGHT = 44
    const BAR_GAP = 18


    // ==================== Section for Frames ===================



    const addGhostZone = () => {
        const TOP_SAFETY_MARGIN = SECTION_TOP_MARGIN;
        const GAP = FRAME_GAP;
        const PADDING = SECTION_PADDING;
        const labelTextContent = `Section ${canvas.getObjects().filter(obj => (obj as any).data?.isGhost).length + 1}`;

        // Calculate dimensions based on the current frame size
        const containerWidth = (frame.width * 2) + GAP + (PADDING * 2);
        const containerHeight = frame.height + (PADDING * 2) + 40;

        // Section container
        const outerContainer = new fabric.Rect({
            width: containerWidth,
            height: containerHeight,
            fill: 'transparent',
            stroke: '#616161', // Slightly lighter to see it better
            strokeDashArray: [10, 8],
            rx: 30,
            ry: 30,
            strokeWidth: 2,
            originX: 'center',
            originY: 'center',
            top: 0
        });

        // 3. The Label
        const labelBg = new fabric.Rect({
            width: 120,
            height: 45,
            fill: '#000',
            rx: 17,
            ry: 17,
            left: -containerWidth / 2 + 30,
            top: -containerHeight / 2 - 17, // Pushes it above the dashed line
            stroke: '#787878',
            strokeWidth: 2
        });

        const labelText = new fabric.Text(labelTextContent, {
            fontSize: 24,
            fill: '#999',
            left: -containerWidth / 2 + 48,
            top: -containerHeight / 2 - 7,
            fontFamily: 'Inter, Arial',
            charSpacing: -70
        })

        const sketchBg = new fabric.Rect({
            left: -containerWidth / 2 + PADDING,
            top: -frame.height / 2 + (TOP_SAFETY_MARGIN / 2),
            width: frame.width,
            height: frame.height,
            fill: '#d1d1d1',
            rx: 20,
            ry: 20
        });

        const aiBg = new fabric.Rect({
            left: GAP / 2,
            top: -frame.height / 2 + (TOP_SAFETY_MARGIN / 2),
            width: frame.width,
            height: frame.height,
            fill: '#d1d1d1',
            rx: 20,
            ry: 20
        });


        const ghostGroup = new fabric.Group([
            outerContainer,
            labelBg,
            labelText,
            sketchBg,
            aiBg
        ], {
            // Position the group so the sketchBg aligns perfectly under the actual frame
            left: frame.left - PADDING,
            top: frame.top - PADDING - TOP_SAFETY_MARGIN,
            selectable: false,
            evented: false, // Prevents ghost zone from blocking clicks to the artboard
        } as any);

        ghostGroup.set('data', {
            isGhost: true,
            sectionId: labelTextContent,
            belongsToFrame: frame.id
        });

        canvas.add(ghostGroup);
        canvas.sendObjectToBack(ghostGroup);
        canvas.requestRenderAll();
    };

    useEffect(() => {
        if (!canvas || !isSourceSketchFrame) return;

        const existing = canvas.getObjects().find(
            (obj: any) => obj.data?.isGhost && obj.data?.belongsToFrame === frame.id
        );
        if (!existing) addGhostZone();

        // This handles both Moving and Scaling in real-time
        const handleSync = (e: any) => {
            const target = e.target;
            if (target.get?.('frameId') === frame.id) {
                const ghosts = canvas.getObjects().filter(
                    (obj: any) => obj.data?.isGhost && obj.data?.belongsToFrame === frame.id
                );

                ghosts.forEach((g: any) => {
                    const PADDING = SECTION_PADDING;
                    const TOP_MARGIN = SECTION_TOP_MARGIN;

                    // Sync position to the frame
                    g.set({
                        left: target.left - PADDING,
                        top: target.top - PADDING - TOP_MARGIN,
                    });

                    // If the frame scaled, update the ghost size
                    if (e.transform?.action === 'scale') {
                        const curW = target.getScaledWidth();
                        const curH = target.getScaledHeight();
                        g.set({
                            width: (curW * 2) + FRAME_GAP + (PADDING * 2),
                            height: curH + (PADDING * 2) + 40
                        });
                    }
                    g.setCoords();
                });
            }
        };

        canvas.on('object:moving', handleSync);
        canvas.on('object:scaling', handleSync);
        return () => {
            canvas.off('object:moving', handleSync);
            canvas.off('object:scaling', handleSync);
        };
    }, [canvas, frame.id, isSourceSketchFrame]);


    const handleAcceptSuggestion = (frameId: string) => {
        if (!canvas) return;

        const fabricFrame = canvas.getObjects().find(
            (obj: any) => obj.get?.('isFrame') && obj.get?.('frameId') === frameId
        );

        if (fabricFrame) {
            fabricFrame.set({
                strokeDashArray: [],
                stroke: '#6366f1',
            });

            // Use the explicit animation config object
            const animOptions: any = {
                property: 'opacity',
                to: 1,
                duration: 300,
                easing: fabric.util.ease.easeOutQuart,
                onChange: () => canvas.requestRenderAll(),
            };

            fabricFrame.animate(animOptions);

            useCanvasStore.getState().updateFrame(frameId, {
                badge: 'AiZone',
                locked: true
            });
        }
    };

    const handleRejectSuggestion = (frameId: string) => {
        if (!canvas) return;

        //  Remove from Canvas with a fade-out
        const objectsToRemove = canvas.getObjects().filter(
            (obj: any) => obj.get?.('frameId') === frameId || obj.get?.('belongsToFrame') === frameId
        );

        objectsToRemove.forEach(obj => {
            obj.animate({
                property: 'opacity',
                to: 0,
                duration: 200,
                onChange: () => canvas.requestRenderAll(),
                onComplete: () => {
                    canvas.remove(obj);
                }
            } as any);
        });

        useCanvasStore.getState().deleteFrame(frameId);
    };

    /* ------------------ BADGE ------------------ */
    const renderBadge = () => {
        const map: Record<string, string> = {
            'sketch': 'SketchZone',
            'idea': 'SketchZone',
            'aizone': 'AiZone',
        }
        const key = String(frame.badge || '').toLowerCase()

        return (
            <Badge className="bg-white/15 text-lg text-white">
                {map[key] ?? 'SketchZone'}
            </Badge>
        )
    }

    /* ------------------ FRAME SIZE ------------------ */
    const HandleFrameSize = (value: string) => {
        const fabricFrame = canvas
            .getObjects()
            .find((obj) => (obj as any).data?.id === frame.id)

        if (!fabricFrame) return

        let width = frame.width
        let height = frame.height

        if (value === 'Desktop') {
            width = 1440
            height = 900
        }

        if (value === 'Tablet') {
            width = 768
            height = 1024
        }

        if (value === 'Mobile') {
            width = 390
            height = 844
        }

        fabricFrame.set({ width, height, scaleX: 1, scaleY: 1 })
        fabricFrame.setCoords()
        canvas.requestRenderAll()

        useCanvasStore.getState().updateFrame(frame.id, { width, height })
    }

    // Thix is the position for the AI screen, we calculate it based on the frame position and size, and we also apply the canvas zoom level to it. This way, the AI screen will always be positioned correctly relative to the frame, even when zooming in and out.

    const aiScreenFrame = pairedAiFrame
        ? pairedAiFrame
        : (isSourceSketchFrame
            ? { left: frame.left + frame.width + FRAME_GAP, top: frame.top, width: frame.width, height: frame.height }
            : null);
    const aiScreenPos = aiScreenFrame
        ? canvasToScreen(canvas, aiScreenFrame.left, aiScreenFrame.top)
        : null;


    /* ------------------ UI ------------------ */
    return (

        <>
            {isSourceSketchFrame && aiScreenPos && aiScreenFrame && (
                <div
                    className={`absolute pointer-events-none  ${isCanvasEmpty ? 'opacity-100' : 'opacity-0' // Just fade it out instead of deleting it
                        }`}
                    style={{
                        left: aiScreenPos.x,
                        top: aiScreenPos.y,
                        width: aiScreenFrame.width * zoom + 1,
                        height: aiScreenFrame.height * zoom + 1,
                        zIndex: 0,
                        borderRadius: '6px',
                        overflow: 'hidden',
                    }}
                >
                    <Grainient />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <span
                            style={{
                                fontFamily: DEFAULT_AI_Heading.fontFamily,
                                fontSize: `${DEFAULT_AI_Heading.fontSize}px`,
                                letterSpacing: `${DEFAULT_AI_Heading.charSpacing / 1000}em`,
                                color: DEFAULT_AI_Heading.fill,
                                fontWeight: 400,
                                lineHeight: 1.1,
                            }}
                        >
                            {DEFAULT_AI_Heading.text}
                        </span>
                        <span
                            style={{
                                fontFamily: DEFAULT_AI_Text.fontFamily,
                                fontSize: '24px',
                                letterSpacing: `${DEFAULT_AI_Text.charSpacing / 1000}em`,
                                color: DEFAULT_AI_Text.fill,
                                lineHeight: 1.2,
                            }}
                        >
                            {DEFAULT_AI_Text.text}
                        </span>
                    </div>
                </div>
            )}
            <div
                className="absolute pointer-events-auto"
                style={{
                    left: pos.x,
                    top: pos.y - (BAR_HEIGHT + BAR_GAP) * zoom,
                }}
            >
                <div
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top left',
                        width: frame.width,
                    }}
                >
                    <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl bg-black/70 text-white text-sm">

                        {/* LEFT */}
                        <div className="flex items-center gap-3">
                            <Select defaultValue="Desktop" onValueChange={HandleFrameSize}>
                                <SelectTrigger className="p-3 rounded-full bg-white/10 border-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e1e1e] text-white">
                                    <SelectItem value="Desktop">Desktop</SelectItem>
                                    <SelectItem value="Tablet">Tablet</SelectItem>
                                    <SelectItem value="Mobile">Mobile</SelectItem>
                                </SelectContent>
                            </Select>

                            {renderBadge()}

                            {
                                frame.role === 'suggestion' && (
                                    <div className="absolute -top-12 left-0 w-full flex justify-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                        <button
                                            onClick={() => handleAcceptSuggestion(frame.id)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1"
                                        >
                                            <Check className="w-3 h-3" /> Keep Suggestion
                                        </button>
                                        <button
                                            onClick={() => handleRejectSuggestion(frame.id)}
                                            className="bg-white hover:bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium shadow-lg border border-red-100"
                                        >
                                            <X className="w-3 h-3" /> Discard
                                        </button>
                                    </div>
                                )
                            }

                        </div>

                        {/* RIGHT */}
                        <div className="flex gap-2">
                            {/* <label className="px-3 py-1.5 flex items-center gap-2 rounded-md bg-white/20 cursor-pointer">
                            <ImagePlus className="w-4 h-4" />
                            Inspiration
                            <input type="file" multiple hidden />
                            </label> */}

                            {/* This is for testing perpose */}
                            {isSourceSketchFrame && (
                                <GenerateButton onClick={GenerateTypeSketch} >
                                    {loader ? (
                                        <span className="">
                                            Generating...
                                        </span>
                                    ) : (
                                        <span className="">
                                            Generate Wireframe
                                        </span>
                                    )}
                                </GenerateButton>
                            )}
                        </div>
                    </div>
                </div>


            </div>
        </>
    )
}

export default FramesOverlay
