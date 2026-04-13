import DENSITY_MAP from "../constants/densityMap/density_map.js"
import { GoogleGenerativeAI } from "@google/generative-ai"

type DensityLevel = "airy" | "normal" | "compact"

const SYSTEM_PROMPT = `
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
✓ Return ONLY valid JSON (no code blocks, no markdown, no explanations)
✓ Always include sidebar, header, and content sections
✓ Sidebar has navigation items with titles
✓ Header has page title and optional subtitle
✓ Content has 4-column grid (cols: 1-4)
✓ Metric cards: use real financial/business metrics
✓ Charts: use realistic chart types (line, bar, pie, area)
✓ Tables: use meaningful table titles and columns
✓ Colors: blue (primary), green (success), red (error), purple (info), orange (warning), amber (neutral)
✓ Always create 2-4 metric cards + 1-2 charts + optional table
✓ Keep it professional and minimal
`

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
          const isDominant = frame.role === "dominant"
          const span = frame.span || (isDominant ? 12 : 6)
          const col =
            frame.col || (span === 12 ? 1 : Math.floor((12 - span) / 2) + 1)
          const rowSpan = isDominant
            ? densityConfig.dominantRowSpan
            : densityConfig.supportingRowSpan

          const placed = {
            ...frame,
            col: Math.floor(col),
            span: Math.min(span, TOTAL_COLUMNS),
            row: currentRow,
            rowSpan,
            type: "card",
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
        text: f.text,
        col: f.col ?? f.colStart ?? 1,
        row: f.row ?? f.rowStart ?? 1,
        span: f.span ?? f.colSpan ?? 12,
        rowSpan: f.rowSpan ?? 1,
      })),
    })),
  }
}

function parseGeminiJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const cleanJson = match[0].replace(/```json/g, "").replace(/```/g, "")
    return JSON.parse(cleanJson)
  } catch {
    return null
  }
}

async function callGeminiLite(payload: { prompt?: string; imageBase64?: string }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing in environment variables.")

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  })

  const userParts: any[] = []
  if (payload.prompt) userParts.push({ text: payload.prompt })
  if (payload.imageBase64) {
    const rawData = payload.imageBase64.split(",")[1] || payload.imageBase64
    userParts.push({
      inlineData: {
        mimeType: "image/png",
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

export async function generatePreviewScreens({
  prompt,
  imageBase64,
  density = "airy",
}: {
  prompt?: string
  imageBase64?: string
  density?: DensityLevel
}) {
  console.log("[generatePreviewScreens] Starting with prompt:", prompt?.substring(0, 50))
  const raw = await callGeminiLite({
    prompt: prompt || "Design this SaaS page",
    imageBase64,
  })

  console.log("[generatePreviewScreens] Raw Gemini response (first 200 chars):", raw.substring(0, 200))

  const parsed = parseGeminiJson(raw)
  if (!parsed?.screens) {
    console.error("[generatePreviewScreens] Failed to parse or no screens:", parsed)
    throw new Error("AI_INVALID_FORMAT")
  }

  console.log("[generatePreviewScreens] Parsed screens:", parsed.screens.length)
  parsed.screens.forEach((s: any, i: number) => {
    console.log(`  [${i}] id=${s.id}, layout=${s.layout}, sections=${Object.keys(s.sections || {}).join(",")}`)
  })

  // Return semantic format directly from Gemini - don't transform to old frames format
  return parsed.screens
}
