// Test/example showing how the new AI generation + canvas rendering work together

import { GenerateRealTimeAi } from './Ai/RealTime_Ai'
import { SemanticCanvasRenderer } from '@/lib/render/semantic-renderer'
import * as fabric from 'fabric'

// Example usage
async function exampleWorkflow() {
  // STEP 1: Generate semantic design structure from sketch + prompt
  const design = await GenerateRealTimeAi({
    prompt: "Create an invoicing dashboard with metrics, charts, and data table",
    imageBase64: undefined, // would be base64 of sketch
    density: "airy"
  })

  console.log('Generated design structure:', JSON.stringify(design, null, 2))

  // STEP 2: Render the design to Fabric.js canvas
  const canvas = new fabric.Canvas('canvas-element', {
    width: 1440,
    height: 900,
    backgroundColor: '#ffffff'
  })

  const renderer = new SemanticCanvasRenderer(false) // false = light mode

  // Example: render the first screen's components
  if (design.screens && design.screens[0]) {
    const screen = design.screens[0]
    
    // Render sections with proper positioning
    let y = 20
    const padding = 20
    
    // Render header
    if (screen.sections?.header) {
      renderer.render(
        { x: padding, y, width: 1440 - padding * 2, height: 80, canvas, isDark: false },
        screen.sections.header as any
      )
      y += 100
    }

    // Render sidebar + content in a layout
    if (screen.sections?.sidebar && screen.sections?.content) {
      const sidebarWidth = 280
      const contentWidth = 1440 - sidebarWidth - padding * 2
      
      // Sidebar on left
      renderer.render(
        { x: padding, y, width: sidebarWidth, height: 700, canvas, isDark: false },
        screen.sections.sidebar as any
      )

      // Content grid on right
      const contentItems = (screen.sections.content as any).items || []
      let contentY = y
      let contentX = padding + sidebarWidth + padding
      let itemsPerRow = 2
      let itemWidth = (contentWidth - padding) / itemsPerRow
      let itemHeight = 200

      contentItems.forEach((item: any, idx: number) => {
        const row = Math.floor(idx / itemsPerRow)
        const col = idx % itemsPerRow

        const itemX = contentX + col * (itemWidth + padding)
        const itemY = contentY + row * (itemHeight + padding)

        renderer.render(
          { x: itemX, y: itemY, width: itemWidth, height: itemHeight, canvas, isDark: false },
          item
        )
      })
    }
  }

  canvas.renderAll()
  return { design, canvas }
}

// EXPECTED OUTPUT:
// Generated design structure will look like:
// {
//   "screens": [
//     {
//       "id": "dashboard-1",
//       "name": "Invoicing Dashboard",
//       "layout": "sidebar",
//       "sections": {
//         "sidebar": {
//           "type": "sidebar",
//           "items": [
//             { "id": "nav-1", "type": "nav", "title": "Dashboard", ...},
//             { "id": "nav-2", "type": "nav", "title": "Customers", ...},
//             ...
//           ]
//         },
//         "header": {
//           "type": "header",
//           "title": "Invoicing",
//           "subtitle": "Manage your invoices"
//         },
//         "content": {
//           "type": "content",
//           "items": [
//             { "id": "revenue-metric", "type": "metric-card", "title": "Total Revenue", "value": "$12,345.67", ... },
//             { "id": "pending-metric", "type": "metric-card", "title": "Pending", "value": "$5,432.10", ... },
//             { "id": "revenue-chart", "type": "chart", "title": "Revenue Over Time", ... },
//             { "id": "recent-invoices", "type": "table", "title": "Recent Invoices", ... }
//           ]
//         }
//       }
//     }
//   ]
// }
//
// Canvas will render professional dashboard with:
// ✓ Styled sidebar with navigation
// ✓ Header with title and subtitle
// ✓ Metric cards with values and change indicators (colored)
// ✓ Charts with gradient backgrounds
// ✓ Tables with alternating row backgrounds
// ✓ Proper spacing and typography using design tokens
// ✓ Dark/light mode support
