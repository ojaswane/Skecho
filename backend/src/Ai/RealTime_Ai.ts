import { GoogleGenerativeAI } from "@google/generative-ai"

type DensityLevel = "airy" | "normal" | "compact"

interface GeneratedComponent {
    id: string
    type: "metric-card" | "chart" | "table" | "card" | "nav" | "header" | "button" | "list" | "section"
    title?: string
    subtitle?: string
    content?: string
    value?: string
    change?: string
    icon?: string
    color?: "blue" | "green" | "red" | "purple" | "orange" | "amber"
    cols?: number
    rows?: number
    items?: any[]
}

interface GeneratedSection {
    id: string
    type: "sidebar" | "header" | "content" | "footer"
    component?: string
    items?: GeneratedComponent[]
    title?: string
}

interface GeneratedScreen {
    id: string
    name: string
    layout: "sidebar" | "full" | "tabs"
    sections: Record<string, GeneratedSection>
    metadata?: Record<string, any>
}

interface AIDesignOutput {
    screens: GeneratedScreen[]
}

type SketchBlock = {
    id?: string
    x: number
    y: number
    w: number
    h: number
    shapeType?: string
    label?: string
}

type SketchSummaryLike = {
    sketchGraph?: {
        blocks?: SketchBlock[]
    }
}

const ENHANCED_SYSTEM_PROMPT = `
You are a WORLD-CLASS SaaS UI/UX DESIGNER creating professional, beautiful dashboards.

YOUR JOB: Convert sketch wireframes into PROFESSIONAL dashboard layouts with:
- Real semantic components (metric cards, charts, tables, navigation)
- Actual realistic content (not Lorem ipsum)
- Professional spacing and hierarchy
- Smart color assignments based on data types
- Clear information architecture

WHEN SKETCH is provided:
- Left/tall boxes → Navigation sidebar or main content
- Top boxes → Header/toolbar
- Grid of boxes → Metric cards or content grid
- Large boxes → Data tables or charts

RETURN VALID JSON (only JSON, no markdown):

{
  "screens": [
    {
      "id": "dashboard-1",
      "name": "Main Dashboard",
      "layout": "sidebar",
      "sections": {
        "sidebar": {
          "id": "sidebar",
          "type": "sidebar",
          "items": [
            {
              "id": "nav-dashboard",
              "type": "nav",
              "title": "Dashboard",
              "icon": "BarChart3"
            },
            {
              "id": "nav-analytics",
              "type": "nav",
              "title": "Analytics",
              "icon": "LineChart"
            }
          ]
        },
        "header": {
          "id": "header",
          "type": "header",
          "title": "Dashboard",
          "subtitle": "Welcome back"
        },
        "content": {
          "id": "content",
          "type": "content",
          "items": [
            {
              "id": "revenue-metric",
              "type": "metric-card",
              "title": "Total Revenue",
              "value": "$45,231.89",
              "change": "+12.5%",
              "icon": "DollarSign",
              "color": "blue",
              "cols": 1
            },
            {
              "id": "orders-metric",
              "type": "metric-card",
              "title": "Orders",
              "value": "2,847",
              "change": "+23.1%",
              "icon": "ShoppingCart",
              "color": "green",
              "cols": 1
            },
            {
              "id": "revenue-chart",
              "type": "chart",
              "title": "Revenue Over Time",
              "chartType": "line",
              "cols": 2,
              "rows": 2
            },
            {
              "id": "orders-table",
              "type": "table",
              "title": "Recent Orders",
              "cols": 2,
              "rows": 2
            }
          ]
        }
      }
    }
  ]
}

CRITICAL RULES:
- Return ONLY valid JSON (no code blocks, no markdown, no explanations)
- Always include sidebar, header, and content sections
- Sidebar has navigation items with titles
- Header has page title and optional subtitle
- Content has 4-column grid (cols: 1-4)
- Metric cards: use real financial/business metrics
- Charts: use realistic chart types (line, bar, pie, area)
- Tables: use meaningful table titles and columns
- Colors: blue (primary), green (success), red (error), purple (info), orange (warning), amber (neutral)
- Always create 2-4 metric cards + 1-2 charts + optional table
- Keep it professional and minimal
`

async function callGeminiForDesign(
    prompt: string,
    imageBase64?: string
): Promise<AIDesignOutput> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing")
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        systemInstruction: ENHANCED_SYSTEM_PROMPT,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
        },
    })

    const userParts: any[] = [{ text: prompt }]

    if (imageBase64) {
        const imageData = imageBase64.includes(",")
            ? imageBase64.split(",")[1]
            : imageBase64
        userParts.push({
            inlineData: {
                mimeType: "image/png",
                data: imageData,
            },
        })
    }

    const result = await model.generateContent({
        contents: [{ role: "user", parts: userParts }],
    })

    let text =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || ""
    if (!text) {
        const fallback = result.response.text
        text = typeof fallback === "function" ? fallback() : fallback || ""
    }

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.error("Failed to extract JSON from response:", text);
        throw new Error("INVALID_AI_RESPONSE");
    }

    const parsed: AIDesignOutput = JSON.parse(jsonMatch[0]);

    if (!parsed.screens || !Array.isArray(parsed.screens)) {
        throw new Error("INVALID_DESIGN_STRUCTURE");
    }

    return parsed;
}

function convertToCanvasFormat(design: AIDesignOutput) {
    // Convert the semantic structure into canvas-ready format
    return {
        ...design,
        screens: design.screens.map((screen) => ({
            id: screen.id,
            name: screen.name,
            layout: screen.layout,
            sections: screen.sections,
            // Add metadata for rendering
            metadata: {
                layout: screen.layout,
                sidebarWidth: screen.layout === "sidebar" ? 280 : 0,
                contentGrid: 4, // 4-column grid for content
            },
        })),
    };
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n))
}

function inferSemanticFromBlock(
    block: SketchBlock,
    allBlocks: SketchBlock[]
): "sidebar" | "nav" | "hero_text" | "media" | "card" {
    const label = String(block.label ?? "").trim().toLowerCase()
    if (["sidebar", "side", "menu", "nav"].includes(label)) return "sidebar"
    if (["header", "topbar", "navbar"].includes(label)) return "nav"
    if (["hero", "title", "copy"].includes(label)) return "hero_text"
    if (["image", "media", "chart"].includes(label)) return "media"

    const aspect = block.w / Math.max(block.h, 0.001)
    const topish = block.y < 0.2
    const edgeish = block.x < 0.12 || block.x + block.w > 0.88
    const tall = block.h > 0.45
    const wide = block.w > 0.55

    if (topish && wide && block.h < 0.18) return "nav"
    if (edgeish && tall && block.w < 0.28) return "sidebar"

    const nonLaneBlocks = allBlocks.filter((candidate) => candidate.id !== block.id)
    const isTopMainBlock =
        wide &&
        aspect > 1.4 &&
        block.y < 0.45 &&
        nonLaneBlocks.some((candidate) => candidate.y > block.y + block.h * 0.6)

    if (isTopMainBlock) return "hero_text"
    if (wide && block.h > 0.18) return "media"

    return "card"
}

function framesFromSketchGraphStrict(sketchSummary?: SketchSummaryLike) {
    const rawBlocks = sketchSummary?.sketchGraph?.blocks ?? []
    const blocks = rawBlocks
        .filter((block) => block && typeof block.x === "number" && typeof block.y === "number")
        .filter((block) => String(block.shapeType ?? "").toLowerCase() !== "line")
        .map((block, index) => ({
            id: block.id ?? `block-${index + 1}`,
            x: clamp(block.x, 0, 1),
            y: clamp(block.y, 0, 1),
            w: clamp(block.w, 0.04, 1),
            h: clamp(block.h, 0.04, 1),
            shapeType: block.shapeType,
            label: block.label,
        }))

    if (!blocks.length) return null

    const frames = blocks.map((block, index) => ({
        id: block.id ?? `frame-${index + 1}`,
        type: "card",
        role: index === 0 ? "dominant" : "supporting",
        semantic: inferSemanticFromBlock(block, blocks),
        col: 1,
        row: index + 1,
        span: 12,
        rowSpan: 1,
        style: {
            bbox: {
                x: block.x,
                y: block.y,
                w: block.w,
                h: block.h,
            },
        },
    }))

    return [
        {
            id: "screen-1",
            name: "Screen 1",
            frames,
        },
    ]
}

export async function GenerateRealTimeAi({
    prompt,
    imageBase64,
    density = "normal",
    sketchSummary,
    layoutMode,
}: {
    prompt?: string
    imageBase64?: string
    density?: DensityLevel
    sketchSummary?: SketchSummaryLike
    layoutMode?: string
}) {
    const mode = String(layoutMode ?? "").toLowerCase()
    const fullPrompt =
        prompt ||
        "Create a professional SaaS dashboard with metrics, charts, and navigation"

    try {
        if (mode === "strict") {
            const strictScreens = framesFromSketchGraphStrict(sketchSummary)
            if (strictScreens?.length) {
                return strictScreens
            }
        }

        const design = await callGeminiForDesign(fullPrompt, imageBase64)
        const canvas = convertToCanvasFormat(design)
        return canvas.screens // Return just the screens array for compatibility
    } catch (error) {
        console.error("Design generation failed:", error)
        throw error
    }
}
