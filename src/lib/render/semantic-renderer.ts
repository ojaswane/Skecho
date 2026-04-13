import * as fabric from 'fabric'
import { designTokens } from '@/lib/design-tokens'

export interface SemanticComponent {
  id: string
  type: string
  title?: string
  subtitle?: string
  content?: string
  value?: string
  change?: string
  icon?: string
  color?: string
}

interface RenderContext {
  x: number
  y: number
  width: number
  height: number
  canvas: fabric.Canvas
  isDark: boolean
}

export class SemanticCanvasRenderer {
  private tokens = designTokens
  private isDark: boolean

  constructor(isDark = false) {
    this.isDark = isDark
  }

  getColors() {
    return this.isDark ? this.tokens.colors.bg.dark : this.tokens.colors.bg.primary
  }

  private getColorValue(colorName?: string) {
    const colorMap: Record<string, string> = {
      blue: this.tokens.colors.primary,
      green: this.tokens.colors.success,
      red: this.tokens.colors.error,
      purple: this.tokens.colors.info,
      orange: this.tokens.colors.warning,
      amber: this.tokens.colors.warning,
    }
    return colorMap[colorName || 'blue']
  }

  renderMetricCard(ctx: RenderContext, component: SemanticComponent) {
    const { x, y, width, height, canvas } = ctx
    const padding = this.tokens.spacing.lg
    const innerWidth = width - padding * 2
    const innerHeight = height - padding * 2

    // Card background
    const card = new fabric.Rect({
      left: x,
      top: y,
      width,
      height,
      fill: this.isDark ? this.tokens.colors.bg.darkSecondary : this.tokens.colors.bg.secondary,
      stroke: this.tokens.colors.border,
      strokeWidth: 1,
      rx: this.tokens.radius.lg,
      selectable: false,
      evented: true,
    })
    canvas.add(card)

    // Color accent bar at top
    const accentColor = this.getColorValue(component.color)
    const accent = new fabric.Rect({
      left: x,
      top: y,
      width,
      height: 4,
      fill: accentColor,
      selectable: false,
      evented: false,
    })
    canvas.add(accent)

    // Title
    const title = new fabric.Text(component.title || 'Metric', {
      left: x + padding,
      top: y + padding,
      fontSize: this.tokens.typography.bodySmall.fontSize,
      fontFamily: 'sans-serif',
      fontWeight: 500,
      fill: this.isDark ? this.tokens.colors.text.secondary : this.tokens.colors.text.secondary,
      selectable: false,
      evented: false,
    })
    canvas.add(title)

    // Value
    const value = new fabric.Text(component.value || '$0', {
      left: x + padding,
      top: y + padding * 3,
      fontSize: 28,
      fontFamily: 'sans-serif',
      fontWeight: 700,
      fill: this.isDark ? this.tokens.colors.text.primary : this.tokens.colors.text.primary,
      selectable: false,
      evented: false,
    })
    canvas.add(value)

    // Change indicator
    if (component.change) {
      const changeColor = component.change.includes('+') ? this.tokens.colors.success : this.tokens.colors.error
      const change = new fabric.Text(component.change, {
        left: x + padding,
        top: y + height - padding - 20,
        fontSize: this.tokens.typography.bodySmall.fontSize,
        fontFamily: 'sans-serif',
        fontWeight: 500,
        fill: changeColor,
        selectable: false,
        evented: false,
      })
      canvas.add(change)
    }
  }

  renderChart(ctx: RenderContext, component: SemanticComponent) {
    const { x, y, width, height, canvas } = ctx
    const padding = this.tokens.spacing.lg

    // Card background
    const card = new fabric.Rect({
      left: x,
      top: y,
      width,
      height,
      fill: this.isDark ? this.tokens.colors.bg.darkSecondary : this.tokens.colors.bg.secondary,
      stroke: this.tokens.colors.border,
      strokeWidth: 1,
      rx: this.tokens.radius.lg,
      selectable: false,
      evented: true,
    })
    canvas.add(card)

    // Title
    const title = new fabric.Text(component.title || 'Chart', {
      left: x + padding,
      top: y + padding,
      fontSize: this.tokens.typography.h4.fontSize,
      fontFamily: 'sans-serif',
      fontWeight: 600,
      fill: this.isDark ? this.tokens.colors.text.primary : this.tokens.colors.text.primary,
      selectable: false,
      evented: false,
    })
    canvas.add(title)

    // Placeholder chart area with gradient
    const chartArea = new fabric.Rect({
      left: x + padding,
      top: y + padding * 3,
      width: width - padding * 2,
      height: height - padding * 4,
      fill: new fabric.Gradient({
        type: 'linear',
        gradientUnits: 'pixels',
        coords: { x1: 0, y1: 0, x2: 0, y2: height - padding * 4 },
        colorStops: [
          { offset: 0, color: this.tokens.colors.primary },
          { offset: 1, color: this.tokens.colors.primaryLight },
        ],
      }),
      rx: this.tokens.radius.md,
      selectable: false,
      evented: false,
      opacity: 0.3,
    })
    canvas.add(chartArea)
  }

  renderTable(ctx: RenderContext, component: SemanticComponent) {
    const { x, y, width, height, canvas } = ctx
    const padding = this.tokens.spacing.lg

    // Card background
    const card = new fabric.Rect({
      left: x,
      top: y,
      width,
      height,
      fill: this.isDark ? this.tokens.colors.bg.darkSecondary : this.tokens.colors.bg.secondary,
      stroke: this.tokens.colors.border,
      strokeWidth: 1,
      rx: this.tokens.radius.lg,
      selectable: false,
      evented: true,
    })
    canvas.add(card)

    // Title
    const title = new fabric.Text(component.title || 'Table', {
      left: x + padding,
      top: y + padding,
      fontSize: this.tokens.typography.h4.fontSize,
      fontFamily: 'sans-serif',
      fontWeight: 600,
      fill: this.isDark ? this.tokens.colors.text.primary : this.tokens.colors.text.primary,
      selectable: false,
      evented: false,
    })
    canvas.add(title)

    // Placeholder rows
    const rowHeight = 40
    const startY = y + padding * 3
    for (let i = 0; i < 4; i++) {
      const row = new fabric.Rect({
        left: x + padding,
        top: startY + i * rowHeight,
        width: width - padding * 2,
        height: rowHeight - 1,
        fill: i % 2 === 0 ? this.tokens.colors.bg.tertiary : 'transparent',
        stroke: this.tokens.colors.border,
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
      })
      canvas.add(row)

      // Placeholder text
      const text = new fabric.Text('Data Row', {
        left: x + padding + 10,
        top: startY + i * rowHeight + 10,
        fontSize: 12,
        fontFamily: 'sans-serif',
        fill: this.isDark ? this.tokens.colors.text.secondary : this.tokens.colors.text.secondary,
        selectable: false,
        evented: false,
      })
      canvas.add(text)
    }
  }

  renderCard(ctx: RenderContext, component: SemanticComponent) {
    const { x, y, width, height, canvas } = ctx
    const padding = this.tokens.spacing.lg

    // Card background
    const card = new fabric.Rect({
      left: x,
      top: y,
      width,
      height,
      fill: this.isDark ? this.tokens.colors.bg.darkSecondary : this.tokens.colors.bg.secondary,
      stroke: this.tokens.colors.border,
      strokeWidth: 1,
      rx: this.tokens.radius.lg,
      selectable: false,
      evented: true,
    })
    canvas.add(card)

    // Title
    if (component.title) {
      const title = new fabric.Text(component.title, {
        left: x + padding,
        top: y + padding,
        fontSize: this.tokens.typography.h4.fontSize,
        fontFamily: 'sans-serif',
        fontWeight: 600,
        fill: this.isDark ? this.tokens.colors.text.primary : this.tokens.colors.text.primary,
        selectable: false,
        evented: false,
      })
      canvas.add(title)
    }

    // Content
    if (component.content) {
      const content = new fabric.Text(component.content, {
        left: x + padding,
        top: y + padding * 3,
        fontSize: this.tokens.typography.body.fontSize,
        fontFamily: 'sans-serif',
        fill: this.isDark ? this.tokens.colors.text.secondary : this.tokens.colors.text.secondary,
        selectable: false,
        evented: false,
      })
      canvas.add(content)
    }
  }

  renderHeader(ctx: RenderContext, component: SemanticComponent) {
    const { x, y, width, height, canvas } = ctx
    const padding = this.tokens.spacing.lg

    // Header background
    const header = new fabric.Rect({
      left: x,
      top: y,
      width,
      height,
      fill: this.isDark ? this.tokens.colors.bg.darkSecondary : this.tokens.colors.bg.secondary,
      stroke: 'transparent',
      selectable: false,
      evented: false,
    })
    canvas.add(header)

    // Title
    if (component.title) {
      const title = new fabric.Text(component.title, {
        left: x + padding,
        top: y + padding,
        fontSize: this.tokens.typography.h2.fontSize,
        fontFamily: 'sans-serif',
        fontWeight: 700,
        fill: this.isDark ? this.tokens.colors.text.primary : this.tokens.colors.text.primary,
        selectable: false,
        evented: false,
      })
      canvas.add(title)
    }

    // Subtitle
    if (component.subtitle) {
      const subtitle = new fabric.Text(component.subtitle, {
        left: x + padding,
        top: y + this.tokens.typography.h2.fontSize + padding * 2,
        fontSize: this.tokens.typography.body.fontSize,
        fontFamily: 'sans-serif',
        fill: this.isDark ? this.tokens.colors.text.secondary : this.tokens.colors.text.secondary,
        selectable: false,
        evented: false,
      })
      canvas.add(subtitle)
    }
  }

  renderSidebar(ctx: RenderContext, component: SemanticComponent) {
    const { x, y, width, height, canvas } = ctx
    const padding = this.tokens.spacing.md

    // Sidebar background
    const sidebar = new fabric.Rect({
      left: x,
      top: y,
      width,
      height,
      fill: this.isDark ? this.tokens.colors.bg.dark : this.tokens.colors.bg.primary,
      stroke: this.tokens.colors.border,
      strokeWidth: 1,
      selectable: false,
      evented: false,
    })
    canvas.add(sidebar)

    // Navigation items
    const items = (component as any).items || []
    let itemY = y + padding

    items.forEach((item: any, idx: number) => {
      const itemHeight = 40
      const isActive = idx === 0

      // Item background
      const itemBg = new fabric.Rect({
        left: x + padding,
        top: itemY,
        width: width - padding * 2,
        height: itemHeight,
        fill: isActive ? this.tokens.colors.primary : 'transparent',
        rx: this.tokens.radius.md,
        selectable: false,
        evented: false,
      })
      canvas.add(itemBg)

      // Item text
      const text = new fabric.Text(item.title || 'Item', {
        left: x + padding * 2,
        top: itemY + 10,
        fontSize: 12,
        fontFamily: 'sans-serif',
        fill: isActive ? '#fff' : this.tokens.colors.text.secondary,
        selectable: false,
        evented: false,
      })
      canvas.add(text)

      itemY += itemHeight + padding
    })
  }

  render(ctx: RenderContext, component: SemanticComponent) {
    switch (component.type) {
      case 'metric-card':
        this.renderMetricCard(ctx, component)
        break
      case 'chart':
        this.renderChart(ctx, component)
        break
      case 'table':
        this.renderTable(ctx, component)
        break
      case 'card':
        this.renderCard(ctx, component)
        break
      case 'header':
        this.renderHeader(ctx, component)
        break
      case 'sidebar':
        this.renderSidebar(ctx, component)
        break
      case 'nav':
        this.renderCard(ctx, component)
        break
      default:
        this.renderCard(ctx, component)
    }
  }
}
