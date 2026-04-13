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
    // Convert the semantic structure into canvas-ready frames
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

export async function GenerateRealTimeAi({
    prompt,
    imageBase64,
    density = "normal",
}: {
    prompt?: string
    imageBase64?: string
    density?: DensityLevel
}) {
    const fullPrompt =
        prompt ||
        "Create a professional SaaS dashboard with metrics, charts, and navigation"

    try {
        const design = await callGeminiForDesign(fullPrompt, imageBase64)
        const canvas = convertToCanvasFormat(design)
        return canvas
    } catch (error) {
        console.error("Design generation failed:", error)
        throw error
    }
}
