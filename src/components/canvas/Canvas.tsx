'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric'
import { useCanvasStore } from '../../../lib/store/canvasStore'
import FrameOverlays from './FrameOverlays'
import type { Frame } from '../../../lib/store/canvasStore'
import SelectionOverlay from './SelectionOverlay'


const CanvasRender = ({ theme }: { theme: 'light' | 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const { setCanvas: setStoreCanvas, setSelectedObject } = useCanvasStore()
  /* =========================
    CANVAS INIT
  ========================= */

  useEffect(() => {
    if (!canvasRef.current || canvas) return

    const c = new fabric.Canvas(canvasRef.current, {
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      selection: true
    })
    c.setWidth(window.innerWidth)
    c.setHeight(window.innerHeight - 120)

    setCanvas(c)
    setStoreCanvas(c as any)

    // Delete key
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        const active = c.getActiveObject()
        if (active) {
          c.remove(active)
          c.requestRenderAll()
        }
      }
    }
    c.on('selection:created', e => {
      setSelectedObject(e.selected?.[0] || null)
    })

    c.on('selection:updated', e => {
      setSelectedObject(e.selected?.[0] || null)
    })

    c.on('selection:cleared', () => {
      setSelectedObject(null)
    })

    window.addEventListener('keydown', onKeyDown)

    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
        e.preventDefault();
      }
    });
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      c.dispose()
    }
  }, [])

  useEffect(() => {
    if (!canvas) return

    canvas.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff'
    canvas.requestRenderAll()

  }, [theme, canvas])

  /* =========================
      DEFAULT FRAME
  ========================= */

  useEffect(() => {
    if (!canvas) return
    const store = useCanvasStore.getState()
    if (store.frames.length > 0) return

    const id = crypto.randomUUID()
    const width = 1440
    const height = 1024

    const frame: Frame = {
      id,
      device: 'desktop',
      badge: 'Idea',
      width,
      height,
      left: canvas.getWidth() / 2 - width / 2,
      top: 80,
      locked: false,
      status: "idle",
      version: 0,
      lastPatchedAt: Date.now(),
    }

    // Frame border
    const frameRect = new fabric.Rect({
      left: frame.left,
      top: frame.top,
      width: frame.width,
      height: frame.height,
      fill: '#d9d9d9',
      stroke: '#888',
      strokeDashArray: [6, 6],
      selectable: true,
      evented: true,
      deletable: false,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: false,
      lockRotation: true,
    })

    frameRect.setControlsVisibility({
      mt: false,
      mb: true, // only scallable to the bottom
      ml: false,
      mr: false,
      bl: false,
      br: false,
      tl: false,
      tr: false,
      mtr: false,
    })

    canvas.on('object:scaling', e => {
      const obj = e.target as fabric.Object
      if (!obj || !obj.get('isFrame')) return // only frame is scalable

      const newHeight = obj.height! * obj.scaleY!

      obj.set({
        height: newHeight,
        scaleY: 1,
      })

      obj.setCoords()
      canvas.requestRenderAll()
    })

    frameRect.set('isFrame', true)
    frameRect.set('frameId', id)

    canvas.add(frameRect)
    store.addFrame(frame)

    canvas.requestRenderAll()
  }, [canvas])

  /* =========================
   FRAME CLIPPING 
========================= */


  useEffect(() => {
    if (!canvas) return

    const handler = (e: any) => {
      const obj = e.target as fabric.Object
      if (!obj || obj.get('isFrame')) return
      if (obj.type === 'activeSelection') return

      const center = obj.getCenterPoint()
      const frames = canvas.getObjects().filter(o => o.get('isFrame')) as fabric.Rect[]

      const targetFrame = frames.find(frame =>
        frame.containsPoint(center)
      )

      if (!targetFrame) {
        obj.set({
          isFrameContent: false,
          frameId: undefined,
        })
        return
      }

      obj.set({
        isFrameContent: true,
        frameId: targetFrame.get('frameId'),
      })
    }

    canvas.on('object:added', handler)
    canvas.on('object:moving', handler)

    return () => {
      canvas.off('object:added', handler)
      canvas.off('object:moving', handler)
    }
  }, [canvas])

  /* =========================
     ZOOM & PAN
  ========================= */

  useEffect(() => {
    if (!canvas) return

    // Smooth trackpad zoom/pan (rAF-batched) for a Figma-like feel.
    let rafId: number | null = null
    let pendingPanX = 0
    let pendingPanY = 0
    let pendingZoomDelta = 0
    let lastPointer: fabric.Point | null = null

    const flush = () => {
      rafId = null
      const zoom = canvas.getZoom()

      if (pendingZoomDelta !== 0 && lastPointer) {
        const zoomFactor = Math.exp(-pendingZoomDelta * 0.0015)
        let newZoom = zoom * zoomFactor
        newZoom = Math.min(Math.max(newZoom, 0.1), 6)
        canvas.zoomToPoint(lastPointer, newZoom)
      }

      if (pendingPanX !== 0 || pendingPanY !== 0) {
        canvas.relativePan(new fabric.Point(-pendingPanX, -pendingPanY))
      }

      pendingPanX = 0
      pendingPanY = 0
      pendingZoomDelta = 0
      canvas.requestRenderAll()
    }

    const onWheel = (opt: any) => {
      const e = opt.e
      const deltaMode = e.deltaMode || 0
      const scale = deltaMode === 1 ? 16 : deltaMode === 2 ? 120 : 1
      const dx = (e.deltaX || 0) * scale
      const dy = (e.deltaY || 0) * scale

      if (e.ctrlKey || e.metaKey) {
        const p = canvas.getPointer(e)
        lastPointer = new fabric.Point(p.x, p.y)
        pendingZoomDelta += dy
      } else {
        const panSpeed = 0.7
        if (e.shiftKey) {
          pendingPanX += dy * panSpeed
        } else {
          pendingPanX += dx * panSpeed
          pendingPanY += dy * panSpeed
        }
      }

      if (rafId == null) {
        rafId = requestAnimationFrame(flush)
      }

      e.preventDefault()
      e.stopPropagation()
    }

    canvas.on('mouse:wheel', onWheel)
    return () => {
      canvas.off('mouse:wheel', onWheel)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [canvas])


  // Add vignette effect styles once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const vignetteStyleId = 'canvas-vignette-style';
      if (!document.getElementById(vignetteStyleId)) {
        const style = document.createElement('style');
        style.id = vignetteStyleId;
        style.innerHTML = `
          .vignette-effect {
            position: relative;
          }
          .vignette-effect::after {
            content: '';
            pointer-events: none;
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            height: 98%; /* leave bottom border clear */
            border-top-left-radius: 1rem;
            border-top-right-radius: 1rem;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            z-index: 10;
            box-shadow:
              0 0 0 16px rgba(0,0,0,0.08),
              0 0 64px 32px rgba(0,0,0,0.13);
            background: linear-gradient(to bottom, rgba(0,0,0,0.13) 0%, rgba(0,0,0,0.07) 80%, rgba(0,0,0,0) 100%);
            filter: blur(4px);
            opacity: 0.85;
            transition: opacity 0.3s;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden mt-5 flex justify-center items-start">
      <div className="rounded-2xl shadow-lg overflow-hidden vignette-effect" style={{ background: theme === 'dark' ? '#1a1a1a' : '#fff', position: 'relative', marginBottom: '0' }}>
        <canvas ref={canvasRef} style={{ borderRadius: '1rem', display: 'block' }} />
        <div className="absolute inset-0 pointer-events-none">
          <SelectionOverlay />
          <FrameOverlays />
        </div>
      </div>
    </div>
  )
}

export default CanvasRender
