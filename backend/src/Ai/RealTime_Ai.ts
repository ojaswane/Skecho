import DENSITY_MAP from "../constants/densityMap/density_map.js"
import { GoogleGenerativeAI } from "@google/generative-ai"

type DensityLevel = "airy" | "normal" | "compact"
type LayoutMode = "strict" | "balanced" | "loose"

type SketchGraphBlock = {
    id?: string
    x: number
    y: number
    w: number
    h: number
    shapeType?: "rect" | "circle" | "line" | "unknown" | string
    confidenceRect?: number
    zone?: "top" | "mid" | "bottom" | string
}

type SketchSummary = {
    counts?: {
        total?: number
        paths?: number
        rects?: number
        circles?: number
        texts?: number
        images?: number
        other?: number
    }
    items?: Array<{
        type?: string
        x: number
        y: number
        w: number
        h: number
        area: number
        zone: "top" | "mid" | "bottom" | string
    }>
    sketchGraph?: {
        version?: number
        blocks?: SketchGraphBlock[]
    }
    bbox?: { minX: number; minY: number; maxX: number; maxY: number } | null
    zones?: { top?: number; mid?: number; bottom?: number }
    hint?: string
}

const SYSTEM_PROMPT = `
You are a SENIOR PRODUCT DESIGNER specialized in SaaS aesthetics.
You will receive a user's prompt and optionally a rough sketch signal.

TASK:
1. Interpret the intent quickly.
2. Return strict JSON with root key "screens".
3. Each screen MUST include a non-empty "frames" array.
4. Each frame MUST include: id, role, span. (You may include col,row,rowSpan,type,text too.)

RULES:
- Keep output strict JSON only (no markdown, no commentary)
- Prefer clean airy spacing
- No explanations
- Always return at least 1 screen
- Always return at least 5 frames per screen

EXPECTED OUTPUT:
{
  "screens": [
    {
      "id": "screen-1",
      "name": "Screen 1",
      "frames": [
        { "id": "hero", "role": "dominant", "span": 12, "type": "card" },
        { "id": "a", "role": "supporting", "span": 6, "type": "card" },
        { "id": "b", "role": "supporting", "span": 6, "type": "card" },
        { "id": "c", "role": "supporting", "span": 4, "type": "card" },
        { "id": "d", "role": "supporting", "span": 4, "type": "card" }
      ]
    }
  ]
}
`

function fallbackFrames() {
    return [
        {
            id: "hero",
            role: "dominant",
            span: 12,
            type: "card"
        },
        {
            id: "features-a",
            role: "supporting",
            span: 6,
            type: "card"
        },
        {
            id: "features-b",
            role: "supporting",
            span: 6,
            type: "card"
        },
        {
            id: "proof",
            role: "supporting",
            span: 4,
            type: "card"
        },
        {
            id: "pricing",
            role: "supporting",
            span: 4,
            type: "card"
        },

        {
            id: "cta",
            role: "supporting",
            span: 4,
            type: "card"
        },
    ]
}

function heroOnlyFrames() {
    return [
        {
            id: "hero",
            role: "dominant",
            span: 12,
            type: "card"
        },
        {
            id: "hero-media",
            role: "supporting",
            span: 12,
            type: "card"
        },
    ]
}

function featureGridFrames() {
    return [
        {
            id: "hero",
            role: "dominant",
            span: 12,
            type: "card"
        },
        {
            id: "feature-1",
            role: "supporting",
            span: 4,
            type: "card"
        },
        {
            id: "feature-2",
            role: "supporting",
            span: 4,
            type: "card"
        },
        {
            id: "feature-3",
            role: "supporting",
            span: 4,
            type: "card"
        },
        {
            id: "cta",
            role: "supporting",
            span: 12,
            type: "card"
        },
    ]
}

function navHeroFeatureGridFrames() {
    return [
        // Keep nav compact by forcing a smaller rowSpan.
        {
            id: "nav",
            role: "supporting",
            span: 12,
            rowSpan: 1,
            type: "card"
        },
        {
            id: "hero",
            role: "dominant",
            span: 12,
            type: "card"
        },
        {
            id: "feature-1",
            role: "supporting",
            span: 4,
            type: "card"
        },
        {
            id: "feature-2",
            role: "supporting",
            span: 4,
            type: "card"
        },

        {
            id: "feature-3",
            role: "supporting",
            span: 4,
            type: "card"
        },
        {
            id: "cta",
            role: "supporting",
            span: 12,
            type: "card"
        },
    ]
}

function navHeroFrames() {
    return [
        {
            id: "nav",
            role: "supporting",
            span: 12,
            rowSpan: 1,
            type: "card"
        },
        {
            id: "hero",
            role: "dominant",
            span: 12,
            type: "card"
        },
        {
            id: "hero-media",
            role: "supporting",
            span: 12,
            type: "card"
        },
    ]
}

// this is for minimal nav section
function navHeroOnlyFrames() {
    return [
        {
            id: "nav",
            role: "supporting",
            span: 12,
            rowSpan: 1,
            type: "card"
        },
        {
            id: "hero",
            role: "dominant",
            span: 12,
            type: "card"
        },
    ]
}

function navHeroMediaCtaFrames() {
    return [
        {
            id: "nav",
            role: "supporting",
            span: 12,
            rowSpan: 1,
            type: "card",
            semantic: "nav",
        },
        {
            id: "hero-text",
            role: "dominant",
            // 2-column hero: text on the left
            col: 1,
            row: 2,
            span: 6,
            rowSpan: 4,
            type: "card",
            semantic: "hero_text",
        },
        {
            id: "hero-media",
            role: "supporting",
            // 2-column hero: media on the right
            col: 7,
            row: 2,
            span: 6,
            rowSpan: 4,
            type: "card",
            semantic: "media",
        },
        {
            id: "cta",
            role: "supporting",
            // CTA under hero text (left column)
            col: 1,
            row: 6,
            span: 3,
            rowSpan: 1,
            type: "card",
            semantic: "cta",
        },
    ]
}

function navHeroTwoColFrames() {
    return [
        {
            id: "nav",
            role: "supporting",
            col: 1,
            row: 1,
            span: 12,
            rowSpan: 1,
            type: "card",
            semantic: "nav",
        },
        {
            id: "hero-text",
            role: "dominant",
            col: 1,
            row: 2,
            span: 6,
            rowSpan: 4,
            type: "card",
            semantic: "hero_text",
        },
        {
            id: "hero-media",
            role: "supporting",
            col: 7,
            row: 2,
            span: 6,
            rowSpan: 4,
            type: "card",
            semantic: "media",
        },
    ]
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n))
}


// MODE: Convert sketchGraph.blocks (normalized 0..1) to frames that match the sketch geometry.
// No "template guessing"
// Only snaps to a 12-col grid
// Rows are inferred by clustering blocks by y-position

function framesFromSketchGraphStrict(sketchGraph?: SketchSummary["sketchGraph"]) {
    const blocks = sketchGraph?.blocks ?? []
    if (!Array.isArray(blocks) || blocks.length === 0) return null

    const usable = blocks
        .filter((b) => b && typeof b.x === "number" && typeof b.y === "number")
        // In strict mode we still ignore pure "line" blocks as layout containers.
        .filter((b) => String(b.shapeType || "").toLowerCase() !== "line")
        .map((b, idx) => ({
            id: b.id || `b-${idx}`,
            x: clamp(b.x, 0, 1),
            y: clamp(b.y, 0, 1),
            w: clamp(b.w, 0.01, 1),
            h: clamp(b.h, 0.01, 1),
            shapeType: b.shapeType,
            confidenceRect: b.confidenceRect ?? 0,
        }))

    if (!usable.length) return null

    // Row clustering by vertical center.
    const sorted = [...usable].sort((a, b) => (a.y + a.h / 2) - (b.y + b.h / 2))
    const rows: Array<{ cy: number; items: typeof usable }> = []
    const tol = 0.12 // normalized tolerance (tuned for hero layouts; adjust later)

    for (const it of sorted) {
        const cy = it.y + it.h / 2
        const last = rows[rows.length - 1]
        if (!last || Math.abs(cy - last.cy) > tol) {
            rows.push({ cy, items: [it] as any })
        } else {
            ; (last.items as any).push(it)
            last.cy = (last.cy * (last.items.length - 1) + cy) / last.items.length
        }
    }

    // Convert to frames with stable row/col placement.
    const frames: any[] = []
    let currentRow = 1
    const consumed = new Set<string>()

    // So we apply a small alignment/centering pass on the final bboxes.
    const centerStrictFrames = (fs: any[]) => {
        const marginX = 0.06
        const marginY = 0.06
        const contentLeft = marginX
        const contentRight = 1 - marginX
        const contentW = Math.max(0.1, contentRight - contentLeft)

        const clamp01 = (n: number) => clamp(n, 0, 1)
        const clampBBox = (b: any) => {
            const w = clamp(b.w, 0.01, 1)
            const h = clamp(b.h, 0.01, 1)
            const x = clamp(b.x, 0, 1 - w)
            const y = clamp(b.y, 0, 1 - h)
            return { x, y, w, h }
        }

        const normalizeBBoxForSemantic = (bboxIn: any, semanticRaw: any) => {
            const semantic = String(semanticRaw ?? "").toLowerCase()
            let { x, y, w, h } = clampBBox(bboxIn)

            // Keep everything inside a consistent vertical rhythm.
            y = clamp(y, marginY, 1 - marginY - h)

            // Nav/footer: always full content width, centered horizontally.
            if (semantic === "nav") {
                // Use a centered "floating" nav card (not full-bleed).
                // Keep width stable even if the sketch is slightly off.
                w = clamp(w, 0.6, contentW)
                x = 0.5 - w / 2
                x = clamp(x, contentLeft, contentRight - w)
                h = clamp(h, 0.06, 0.16)
                y = Math.min(y, marginY * 0.6)
                return clampBBox({ x, y, w, h })
            }
            if (semantic === "footer") {
                w = contentW
                x = contentLeft
                h = clamp(h, 0.06, 0.18)
                y = 1 - marginY * 0.6 - h
                return clampBBox({ x, y, w, h })
            }

            // Sidebars should stay on their side (left/right), but still be snapped to margins.
            if (semantic === "sidebar") {
                w = clamp(w, 0.12, 0.28)
                const centerX = x + w / 2
                x = centerX < 0.5 ? contentLeft : contentRight - w
                y = clamp(y, marginY, 1 - marginY - h)
                return clampBBox({ x, y, w, h })
            }

            // Default: center horizontally within the content area (doesn't change the overall structure).
            w = clamp(w, 0.08, contentW)
            x = 0.5 - w / 2
            x = clamp(x, contentLeft, contentRight - w)
            return clampBBox({ x, y, w, h })
        }

        return fs.map((f) => {
            const bbox = f?.style?.bbox
            if (!bbox || typeof bbox.x !== "number") return f
            const newB = normalizeBBoxForSemantic(bbox, f.semantic)

            // Keep col/span roughly consistent with the corrected bbox (even though renderer prefers bbox).
            const span = clamp(Math.max(1, Math.round(newB.w * 12)), 1, 12)
            const col = clamp(Math.floor(newB.x * 12) + 1, 1, 13 - span)
            const rowSpan = clamp(Math.max(1, Math.round(newB.h * 6)), 1, 10)

            return {
                ...f,
                col,
                span,
                rowSpan,
                style: {
                    ...(f.style ?? {}),
                    bbox: newB,
                },
            }
        })
    }

    // Identify a dominant block (largest area) excluding nav-like bars.
    const areaOf = (b: any) => b.w * b.h

    const isNavLike = (b: any) => {
        const aspect = b.w / Math.max(1e-6, b.h)
        return b.y <= 0.22 && b.h <= 0.18 && b.w >= 0.5 && aspect >= 4
    }

    const isFooterLike = (b: any) => {
        const aspect = b.w / Math.max(1e-6, b.h)
        return b.y + b.h >= 0.82 && b.h <= 0.22 && b.w >= 0.55 && aspect >= 3
    }

    const isSidebarLike = (b: any) => {
        const nearLeft = b.x <= 0.1
        const nearRight = b.x + b.w >= 0.9
        return b.w <= 0.26 && b.h >= 0.5 && (nearLeft || nearRight)
    }

    const isCtaLike = (b: any) => {
        const aspect = b.w / Math.max(1e-6, b.h)
        const area = areaOf(b)
        const small = area <= 0.08
        const pillish = b.h <= 0.22 && aspect >= 1.4 && aspect <= 10
        const lowerHalf = b.y >= 0.35
        return small && pillish && lowerHalf
    }

    const isHeroTextLike = (b: any) => {
        const area = areaOf(b)
        const wide = b.w >= 0.45
        const notTall = b.h <= 0.35
        const nearTop = b.y <= 0.65
        return wide && notTall && nearTop && area >= 0.04 && area <= 0.35
    }

    const isMediaLike = (b: any) => {
        const area = areaOf(b)
        return area >= 0.22 && b.h >= 0.28
    }

    const dominant = [...usable]
        .filter((b) => !isNavLike(b))
        .sort((a, b) => areaOf(b) - areaOf(a))[0]

    // Heuristic patterns to identify common UI groupings and assign semantics.
    const unionBBox = (items: any[]) => {
        const minX = Math.min(...items.map((it) => it.x))
        const minY = Math.min(...items.map((it) => it.y))
        const maxX = Math.max(...items.map((it) => it.x + it.w))
        const maxY = Math.max(...items.map((it) => it.y + it.h))
        return {
            x: minX,
            y: minY,
            w: Math.max(0.01, maxX - minX),
            h: Math.max(0.01, maxY - minY)
        }
    }

    const frameFromBBox = (opts: { id: string; bbox: { x: number; y: number; w: number; h: number }; semantic: any; role?: string; row: number }) => {
        const b = opts.bbox
        const span = clamp(Math.max(1, Math.round(b.w * 12)), 1, 12)
        const col = clamp(Math.floor(b.x * 12) + 1, 1, 13 - span)
        const rowSpan = clamp(Math.max(1, Math.round(b.h * 6)), 1, 10)
        frames.push({
            id: opts.id,
            type: "card",
            role: opts.role ?? "supporting",
            semantic: opts.semantic,
            col,
            row: opts.row,
            span,
            rowSpan,
            style: {
                bbox:
                {
                    x: b.x,
                    y: b.y,
                    w: b.w,
                    h: b.h
                }
            },
        })
        return rowSpan
    }

    // --- Pattern grouping (variety) ---
    // FAQ: a stack of thin wide rows -> emit a single `faq` container.
    const isFaqRowLike = (b: any) => {
        if (isNavLike(b) || isFooterLike(b) || isSidebarLike(b)) return false
        return b.w >= 0.6 && b.h <= 0.16 && b.y >= 0.22
    }
    const faqRows = [...usable].filter(isFaqRowLike).sort((a, b) => a.y - b.y)
    const faqStart = new Map<string, { ids: string[]; bbox: { x: number; y: number; w: number; h: number } }>()
    {
        let group: any[] = []
        let last: any | null = null
        const closeEnough = (a: any, b: any) => {
            const xOk = Math.abs(a.x - b.x) <= 0.08
            const wOk = Math.abs(a.w - b.w) <= 0.22
            const gap = b.y - (a.y + a.h)
            const gapOk = gap >= -0.02 && gap <= 0.12
            return xOk && wOk && gapOk
        }
        // flush is basically to emit a faq container for the current group if it has enough items
        const flush = () => {
            if (group.length >= 4) {
                const bbox = unionBBox(group)
                const ids = group.map((g) => g.id)
                faqStart.set(group[0].id, { ids, bbox })
            }
            group = []
            last = null
        }
        for (const r of faqRows) {
            if (!last) {
                group = [r]
                last = r
                continue
            }
            if (closeEnough(last, r)) {
                group.push(r)
                last = r
                continue
            }
            flush()
            group = [r]
            last = r
        }
        flush()
    }

    for (const row of rows) {
        const rowItems = [...row.items].sort((a, b) => a.x - b.x)
        const rowSpans: number[] = []

        // If this row starts an FAQ group, emit it as a single container and consume the children.
        for (const it of rowItems) {
            const group = faqStart.get(it.id)
            if (!group) continue
            const alreadyConsumed = group.ids.some((id) => consumed.has(id))
            if (alreadyConsumed) break
            group.ids.forEach((id) => consumed.add(id))
            rowSpans.push(
                frameFromBBox({
                    id: `faq-${group.ids[0]}`,
                    bbox: group.bbox,
                    semantic: "faq",
                    row: currentRow,
                    role: "supporting",
                })
            )
            break
        }

        // Row pattern: 3 similar boxes -> pricing / feature_grid container.
        const available = rowItems.filter((b) => !consumed.has(b.id) && !isNavLike(b) && !isFooterLike(b) && !isSidebarLike(b) && !isCtaLike(b))
        const findTriple = (items: any[], opts: { wTol: number; hTol: number }) => {
            if (items.length < 3) return null
            const sorted = [...items].sort((a, b) => a.x - b.x)
            for (let i = 0; i <= sorted.length - 3; i++) {
                const a = sorted[i]
                const b = sorted[i + 1]
                const c = sorted[i + 2]
                const wAvg = (a.w + b.w + c.w) / 3
                const hAvg = (a.h + b.h + c.h) / 3
                const wOk =
                    Math.abs(a.w - wAvg) / wAvg <= opts.wTol &&
                    Math.abs(b.w - wAvg) / wAvg <= opts.wTol &&
                    Math.abs(c.w - wAvg) / wAvg <= opts.wTol
                const hOk =
                    Math.abs(a.h - hAvg) / hAvg <= opts.hTol &&
                    Math.abs(b.h - hAvg) / hAvg <= opts.hTol &&
                    Math.abs(c.h - hAvg) / hAvg <= opts.hTol
                if (!wOk || !hOk) continue
                return [a, b, c]
            }
            return null
        }

        const pricingCandidates = available.filter((b) => b.h >= 0.28 && b.w >= 0.12 && b.w <= 0.42)
        const pricingTriple = findTriple(pricingCandidates, { wTol: 0.28, hTol: 0.22 })
        if (pricingTriple) {
            const bbox = unionBBox(pricingTriple)
            pricingTriple.forEach((t) => consumed.add(t.id))
            rowSpans.push(
                frameFromBBox({
                    id: `pricing-${pricingTriple[0].id}`,
                    bbox,
                    semantic: "pricing",
                    row: currentRow,
                    role: "supporting",
                })
            )
        } else {
            const gridCandidates = available.filter((b) => b.h >= 0.12 && b.h <= 0.35 && b.w >= 0.12 && b.w <= 0.45)
            const gridTriple = findTriple(gridCandidates, { wTol: 0.3, hTol: 0.28 })
            if (gridTriple) {
                const bbox = unionBBox(gridTriple)
                gridTriple.forEach((t) => consumed.add(t.id))
                rowSpans.push(
                    frameFromBBox({
                        id: `feature-${gridTriple[0].id}`,
                        bbox,
                        semantic: "feature_grid",
                        row: currentRow,
                        role: "supporting",
                    })
                )
            }
        }

        for (const b of rowItems) {
            if (consumed.has(b.id)) continue
            const span = clamp(Math.max(1, Math.round(b.w * 12)), 1, 12)
            const col = clamp(Math.floor(b.x * 12) + 1, 1, 13 - span)
            const rowSpan = clamp(Math.max(1, Math.round(b.h * 6)), 1, 8)
            rowSpans.push(rowSpan)

            // Minimal semantics (helps renderer) without changing geometry.
            let semantic: any = "card"
            if (isNavLike(b)) semantic = "nav"
            else if (isFooterLike(b)) semantic = "footer"
            else if (isSidebarLike(b)) semantic = "sidebar"
            else if (isCtaLike(b)) semantic = "cta"
            else if (isMediaLike(b)) semantic = "media"
            else if (isHeroTextLike(b)) semantic = "hero_text"

            frames.push({
                id: b.id,
                type: "card",
                role: dominant && dominant.id === b.id ? "dominant" : "supporting",
                semantic,
                col,
                row: currentRow,
                span,
                rowSpan,
                style: {
                    bbox: { x: b.x, y: b.y, w: b.w, h: b.h },
                },
            })
        }

        const maxSpan = rowSpans.length ? Math.max(...rowSpans) : 1
        currentRow += maxSpan + 1
    }

    return centerStrictFrames(frames)
}

// it looks the feedback / summary from frontend and decides which layout template to use
function framesFromSketchSummary(sketchSummary?: SketchSummary) {
    const items = sketchSummary?.items ?? []
    const bbox = sketchSummary?.bbox
    if (!items.length || !bbox) return null

    const bboxW = Math.max(1, bbox.maxX - bbox.minX)
    const bboxH = Math.max(1, bbox.maxY - bbox.minY)
    const bboxArea = bboxW * bboxH

    const topItems = items.filter((it) => String(it.zone).toLowerCase() === "top")
    const midItems = items.filter((it) => String(it.zone).toLowerCase() === "mid")

    // Navbar heuristics:
    // either user draws a long thin bar at the top to get te appropriate results
    const isTopNavBarLike = (it: any) => {
        const wRatio = it.w / bboxW
        const hRatio = it.h / bboxH
        const aspect = it.w / Math.max(1, it.h)
        const y = (it.y - bbox.minY) / bboxH
        const wideEnough = wRatio >= 0.5
        const thinEnough = hRatio <= 0.22
        const nearTop = y <= 0.25
        const barLike = aspect >= 4
        const notHuge = (it.area ?? 0) <= bboxArea * 0.25
        return wideEnough && thinEnough && nearTop && barLike && notHuge
    }
    const thinBar = topItems.find(isTopNavBarLike)
    const hasNav = Boolean(thinBar || topItems.length >= 4)

    const relX = (it: any) => (it.x - bbox.minX) / bboxW
    const relY = (it: any) => (it.y - bbox.minY) / bboxH

    // CTA heuristics (loose on purpose):
    // users can place CTAs anywhere, but a "floating CTA" is usually a small item
    // in the lower half of the composition. We DON'T require bottom zone only.
    const floatingCta = items
        .filter((it) => !(String(it.zone).toLowerCase() === "top" && isTopNavBarLike(it)))
        .filter((it) => (it.area ?? 0) <= bboxArea * 0.05)
        .filter((it) => relY(it) >= 0.5)
        .sort((a, b) => (a.area ?? 0) - (b.area ?? 0))[0]

    // Hero-text bar heuristics: wide-ish, relatively short, above the main media.
    const isHeroTextLike = (it: any) => {
        const wRatio = it.w / bboxW
        const hRatio = it.h / bboxH
        const area = it.area ?? 0
        const y = relY(it)
        return (
            wRatio >= 0.55 &&
            hRatio <= 0.35 &&
            y <= 0.55 &&
            area >= bboxArea * 0.05 &&
            area <= bboxArea * 0.4
        )
    }
    const heroTextCandidate = items
        .filter((it) => !(String(it.zone).toLowerCase() === "top" && isTopNavBarLike(it)))
        .filter(isHeroTextLike)
        .sort((a, b) => (b.area ?? 0) - (a.area ?? 0))[0]

    // Media heuristics: big block (often image/video) that takes lots of area.
    const isMediaLike = (it: any) => {
        const area = it.area ?? 0
        const hRatio = it.h / bboxH
        return area >= bboxArea * 0.3 && hRatio >= 0.25
    }
    const mediaCandidate = items
        .filter((it) => !(String(it.zone).toLowerCase() === "top" && isTopNavBarLike(it)))
        .filter(isMediaLike)
        .sort((a, b) => (b.area ?? 0) - (a.area ?? 0))[0]

    // Hero :
    // Prefer the biggest *non-nav-like* item in top/mid as the hero candidate.
    // This fixes sketches like: "thin top bar + one huge mid box" (common on landing pages).
    const heroCandidate = items
        .filter((it) => !(String(it.zone).toLowerCase() === "top" && isTopNavBarLike(it)))
        .filter((it) => {
            const z = String(it.zone).toLowerCase()
            return z === "top" || z === "mid"
        })
        .sort((a, b) => (b.area ?? 0) - (a.area ?? 0))[0]
    // If we have a hero-text candidate, accept it as "hero" even if it isn't massive.
    // Otherwise fall back to the big hero candidate threshold.
    const hasHero = Boolean(heroTextCandidate || (heroCandidate && heroCandidate.area >= bboxArea * 0.25))
    const hasMedia = Boolean(mediaCandidate)

    const midSorted = midItems.sort((a, b) => (b.area ?? 0) - (a.area ?? 0))
    const top3 = midSorted.slice(0, 3)
    const has_3_Cards = top3.length === 3 && top3[2].area >= bboxArea * 0.05

    console.log("[layout] sketchSummary", {
        items: items.length,
        hasNav,
        hasHero,
        hasMedia,
        has3Cards: has_3_Cards,
        hasFloatingCta: Boolean(floatingCta),
    })
    if (!hasNav) {
        const topDebug = topItems.map((it) => ({
            w: it.w,
            h: it.h,
            area: it.area,
            wRatio: Number((it.w / bboxW).toFixed(2)),
            hRatio: Number((it.h / bboxH).toFixed(2)),
            aspect: Number((it.w / Math.max(1, it.h)).toFixed(2)),
            y: Number((((it.y - bbox.minY) / bboxH) || 0).toFixed(2)),
        }))
        console.log("[layout] nav-miss topItems", topDebug)
    }

    // Pattern: navbar + hero + 3 mid boxes => nav + hero + 3 feature cards + CTA.
    if (hasNav && hasHero && has_3_Cards) return navHeroFeatureGridFrames()

    // Pattern: big top box + 3 mid boxes => hero + 3 feature cards + CTA.
    if (hasHero && has_3_Cards) return featureGridFrames()

    // Pattern: navbar + hero + media (+ optional floating CTA).
    // This matches: top nav bar, then a hero text band, then a big image box.
    if (hasNav && hasHero && hasMedia) {
        if (floatingCta) return navHeroMediaCtaFrames()
        return navHeroTwoColFrames()
    }

    // Pattern: navbar + hero => nav + hero (optionally + media).
    // If the sketch is very minimal (e.g., bar + big box), keep it minimal too.
    if (hasNav && hasHero) {
        if (items.length <= 3) return navHeroOnlyFrames()
        return navHeroFrames()
    }

    // Pattern: only a big top box => hero-only.
    if (hasHero) return heroOnlyFrames()
    return null
}

function applyLayout(design: any, density: DensityLevel = "normal") {
    const densityConfig = DENSITY_MAP[density]
    const TOTAL_COLUMNS = 12

    return {
        ...design,
        screens: design.screens.map((screen: any) => {
            let currentRow = 1
            return {
                ...screen,
                frames: (screen.frames || []).map((frame: any) => {
                    // If a template already placed the frame, don't re-flow it.
                    if (frame.row != null && frame.col != null) {
                        return {
                            ...frame,
                            col: Math.floor(frame.col),
                            span: Math.min(frame.span ?? TOTAL_COLUMNS, TOTAL_COLUMNS),
                            row: Math.floor(frame.row),
                            rowSpan: frame.rowSpan ?? 1,
                            type: frame.type ?? "card",
                        }
                    }

                    const isDominant = frame.role === "dominant"
                    const span = frame.span || (isDominant ? 12 : 6)
                    const col =
                        frame.col || (span === 12 ? 1 : Math.floor((12 - span) / 2) + 1)
                    const rowSpan =
                        frame.rowSpan ??
                        (isDominant
                            ? densityConfig.dominantRowSpan
                            : densityConfig.supportingRowSpan)

                    const placed = {
                        ...frame,
                        col: Math.floor(col),
                        span: Math.min(span, TOTAL_COLUMNS),
                        row: currentRow,
                        rowSpan,
                        type: frame.type ?? "card",
                    }

                    if (span > 8) currentRow += rowSpan + densityConfig.rowGap
                    return placed
                }),
            }
        }),
    }
}

function normalizeForCanvas(layout: any) {
    return {
        ...layout,
        screens: (layout.screens || []).map((s: any, si: number) => ({
            id: s.id || `screen-${si + 1}`,
            name: s.name || `Screen ${si + 1}`,
            frames: (s.frames || []).map((f: any, fi: number) => ({
                id: f.id || `frame-${si}-${fi}`,
                type: f.type || "card",
                role: f.role,
                // Preserve semantic hints (used by the frontend renderer)
                semantic: f.semantic,
                text: f.text,
                // Preserve any auxiliary style payload (e.g. strict-mode bbox)
                style: f.style,
                col: f.col ?? f.colStart ?? 1,
                row: f.row ?? f.rowStart ?? 1,
                span: f.span ?? f.colSpan ?? 12,
                rowSpan: f.rowSpan ?? 1,
            })),
        })),
    }
}

function parseGeminiJson(rawText: string) {
    if (!rawText) return null

    const trimmed = rawText.trim()

    // 1) Try direct JSON first (responseMimeType often yields pure JSON).
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
            return JSON.parse(trimmed)
        } catch {
            // fall through
        }
    }

    // 2) Strip fenced blocks, then retry.
    const unfenced = trimmed.replace(/```json/gi, "").replace(/```/g, "").trim()
    if (unfenced.startsWith("{") || unfenced.startsWith("[")) {
        try {
            return JSON.parse(unfenced)
        } catch {
            // fall through
        }
    }

    // 3) Last resort: extract a JSON object/array substring.
    const objMatch = unfenced.match(/\{[\s\S]*\}/)
    if (objMatch?.[0]) {
        try {
            return JSON.parse(objMatch[0])
        } catch {
            // fall through
        }
    }
    const arrMatch = unfenced.match(/\[[\s\S]*\]/)
    if (arrMatch?.[0]) {
        try {
            return JSON.parse(arrMatch[0])
        } catch {
            // fall through
        }
    }

    return null
}

function coerceScreens(parsed: any): any[] | null {
    if (!parsed) return null
    if (Array.isArray(parsed)) return parsed
    if (Array.isArray(parsed.screens)) return parsed.screens
    if (Array.isArray(parsed.Screens)) return parsed.Screens
    if (Array.isArray(parsed.data?.screens)) return parsed.data.screens
    // Common alternative shapes: a single object with `frames` or a doc-like object with `sections`.
    if (Array.isArray(parsed.frames)) {
        return [
            {
                id: parsed.id ?? "screen-1",
                name: parsed.name ?? "Screen 1",
                frames: parsed.frames,
            },
        ]
    }
    if (Array.isArray(parsed.sections)) {
        const frames = parsed.sections.map((s: any, i: number) => ({
            id: s.id ?? `section-${i + 1}`,
            role: s.role ?? "supporting",
            col: s.layout?.col ?? s.layout?.colStart,
            row: s.layout?.row ?? s.layout?.rowStart,
            span: s.layout?.span ?? s.layout?.colSpan ?? 12,
            rowSpan: s.layout?.rowSpan ?? 1,
            type: "card",
            text: s.name ?? s.title,
        }))
        return [
            {
                id: parsed.id ?? "screen-1",
                name: parsed.name ?? "Screen 1",
                frames,
            },
        ]
    }
    return null
}

async function callGeminiFlash(payload: { prompt?: string; imageBase64?: string; strict?: boolean }) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing in environment variables.")

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: payload.strict ? 0 : 0.2,
        },
    })

    const userParts: any[] = []
    const basePrompt = payload.prompt?.trim() || "Design this SaaS page"
    const strictSuffix = payload.strict
        ? "\nReturn ONLY valid JSON with root key \"screens\". No markdown, no commentary."
        : ""
    userParts.push({ text: `${basePrompt}${strictSuffix}` })


    // This piece of code is to conver the image into the mimeType
    if (payload.imageBase64) {
        const [prefix, rest] = payload.imageBase64.split(",", 2)
        const rawData = rest || payload.imageBase64
        const mimeType =
            prefix?.includes("image/jpeg") ? "image/jpeg" :
                prefix?.includes("image/jpg") ? "image/jpeg" :
                    prefix?.includes("image/webp") ? "image/webp" : "image/png"
        userParts.push({
            inlineData: {
                mimeType,
                data: rawData,
            },
        })
    }

    const result = await model.generateContent({
        contents: [{ role: "user", parts: userParts }],
    })

    let text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || ""
    if (!text) {
        const fallback = result.response.text
        text = typeof fallback === "function" ? fallback() : fallback || ""
    }
    return text
}

export async function GenerateRealTimeAi({
    prompt,
    imageBase64,
    density = "airy",
    sketchSummary,
    layoutMode = "balanced",
}: {
    prompt?: string
    imageBase64?: string
    density?: DensityLevel
    sketchSummary?: SketchSummary
    layoutMode?: LayoutMode | string
}) {
    const total = sketchSummary?.counts?.total ?? 0
    const rects = sketchSummary?.counts?.rects ?? 0
    const hint = String(sketchSummary?.hint ?? "").toLowerCase()
    const mode = String(layoutMode || "balanced").toLowerCase()

    // STRICT MODE: if we have sketchGraph blocks, match the sketch geometry exactly.
    if (mode === "strict") {
        const strictFrames = framesFromSketchGraphStrict(sketchSummary?.sketchGraph)
        if (strictFrames?.length) {
            const screen = { id: "screen-1", name: "Screen 1", frames: strictFrames }
            return [normalizeForCanvas({ screens: [screen] }).screens[0]]
        }
    }

    // Best signal: use bbox/zones/items to pick a deterministic layout (fast + stable).
    const templateFrames = framesFromSketchSummary(sketchSummary)
    if (templateFrames) {
        const screen = {
            id: "screen-1",
            name: "Screen 1",
            frames: templateFrames
        }
        const withLayout = applyLayout({ screens: [screen] }, density)
        return [normalizeForCanvas(withLayout).screens[0]]
    }

    // Template shortcut: for tiny sketches, return a small, stable layout instead of a full page.
    // This makes "one line" or "few strokes" feel intentional and avoids random big layouts.
    if (sketchSummary && total > 0 && total < 5) {
        const screen = { id: "screen-1", name: "Screen 1", frames: heroOnlyFrames() }
        const withLayout = applyLayout({ screens: [screen] }, density)
        return [normalizeForCanvas(withLayout).screens[0]]
    }

    // If the user sketched multiple boxes (rects), prefer a grid-ish landing section template.
    if (sketchSummary && (rects >= 3 || hint === "grid")) {
        const screen = { id: "screen-1", name: "Screen 1", frames: featureGridFrames() }
        const withLayout = applyLayout({ screens: [screen] }, density)
        return [normalizeForCanvas(withLayout).screens[0]]
    }

    const basePrompt = prompt || "Design this SaaS page"
    const summarySuffix = sketchSummary
        ? `\nSketch summary (use to decide layout size): total=${total}, rects=${rects}, hint=${hint || "none"}.`
        : ""

    const raw1 = await callGeminiFlash({
        prompt: `${basePrompt}${summarySuffix}`,
        imageBase64,
    })

    let parsed = parseGeminiJson(raw1)
    let screens = coerceScreens(parsed)

    // One retry with a stricter prompt + temperature=0 if the first response isn't usable.
    if (!screens?.length) {
        const raw2 = await callGeminiFlash({
            prompt: `${basePrompt}${summarySuffix}`,
            imageBase64,
            strict: true,
        })
        parsed = parseGeminiJson(raw2)
        screens = coerceScreens(parsed)
    }

    if (!screens?.length) {
        console.log("[ai] AI_INVALID_FORMAT snippet:", String(raw1 || "").slice(0, 400))
        throw new Error("AI_INVALID_FORMAT")
    }

    const normalizedScreens = screens.map((screen: any, i: number) => {
        const safeScreen = {
            id: screen?.id ?? `screen-${i + 1}`,
            name: screen?.name ?? `Screen ${i + 1}`,
            ...screen,
            frames:
                Array.isArray(screen?.frames) && screen.frames.length
                    ? screen.frames
                    : fallbackFrames(),
        }

        const withLayout = applyLayout({ screens: [safeScreen] }, density)
        return normalizeForCanvas(withLayout).screens[0]
    })

    return normalizedScreens
}
