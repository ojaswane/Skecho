'use client'

import React from 'react'

export type ReactRenderBlockKind =
  | 'profile_image'
  | 'content_image'
  | 'title_text'
  | 'body_text'
  | 'meta_text'
  | 'primary_action'

export type ReactRenderElement = {
  id: string
  type?: string
  semantic?: string
  role?: string
  bbox?: { x: number; y: number; w: number; h: number }
  col?: number
  row?: number
  span?: number
  rowSpan?: number
  title?: string
  value?: string
  change?: string
  icon?: string
  color?: string
  blocks?: { id: string; kind: ReactRenderBlockKind }[]
}

export type ReactRenderSection = {
  id?: string
  type?: string
  title?: string
  subtitle?: string
  items?: ReactRenderElement[]
  elements?: ReactRenderElement[]
}

export type ReactRenderScreen = {
  id: string
  name?: string
  frameId?: string
  layout?: string
  sections?: Record<string, ReactRenderSection> | ReactRenderSection[]
  elements?: ReactRenderElement[]
}

type RenderReactProps = {
  screens: ReactRenderScreen[]
}

const fallbackMetrics = [
  { title: 'Total Revenue', value: '$45,231', change: '+12.5%', color: 'blue' },
  { title: 'Active Users', value: '24,892', change: '+8.2%', color: 'green' },
  { title: 'Conversion', value: '6.84%', change: '+2.1%', color: 'purple' },
  { title: 'Open Tickets', value: '128', change: '-4.3%', color: 'orange' },
]

const chartBars = [42, 68, 54, 86, 61, 93, 72, 78]

function colorClasses(color?: string) {
  const palette: Record<string, { bg: string; text: string; ring: string; soft: string }> = {
    blue: {
      bg: 'bg-blue-600',
      text: 'text-blue-700',
      ring: 'ring-blue-100',
      soft: 'bg-blue-50',
    },
    green: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-700',
      ring: 'ring-emerald-100',
      soft: 'bg-emerald-50',
    },
    purple: {
      bg: 'bg-violet-600',
      text: 'text-violet-700',
      ring: 'ring-violet-100',
      soft: 'bg-violet-50',
    },
    orange: {
      bg: 'bg-orange-500',
      text: 'text-orange-700',
      ring: 'ring-orange-100',
      soft: 'bg-orange-50',
    },
    red: {
      bg: 'bg-rose-600',
      text: 'text-rose-700',
      ring: 'ring-rose-100',
      soft: 'bg-rose-50',
    },
    amber: {
      bg: 'bg-amber-500',
      text: 'text-amber-700',
      ring: 'ring-amber-100',
      soft: 'bg-amber-50',
    },
  }

  return palette[color ?? ''] ?? palette.blue
}

function sectionRecord(screen: ReactRenderScreen) {
  if (!screen.sections || Array.isArray(screen.sections)) return null
  return screen.sections
}

function semanticOf(element: ReactRenderElement) {
  return String(element.semantic ?? element.type ?? 'card').toLowerCase()
}

function elementsFromScreen(screen: ReactRenderScreen) {
  const sections = sectionRecord(screen)
  if (sections?.content?.items?.length) return sections.content.items
  if (sections?.content?.elements?.length) return sections.content.elements
  return screen.elements ?? []
}

function hasSketchGeometry(elements: ReactRenderElement[]) {
  return elements.some((element) => element.bbox || typeof element.col === 'number' || typeof element.row === 'number')
}

function navItems(screen: ReactRenderScreen) {
  const sections = sectionRecord(screen)
  if (sections?.sidebar?.items?.length) return sections.sidebar.items
  return [
    { id: 'nav-dashboard', title: 'Dashboard' },
    { id: 'nav-analytics', title: 'Analytics' },
    { id: 'nav-customers', title: 'Customers' },
    { id: 'nav-settings', title: 'Settings' },
  ]
}

function headerCopy(screen: ReactRenderScreen) {
  const sections = sectionRecord(screen)
  return {
    title: sections?.header?.title ?? screen.name ?? 'Executive Dashboard',
    subtitle: sections?.header?.subtitle ?? 'Live overview of product, revenue, and customer health.',
  }
}

function metricData(element: ReactRenderElement, index: number) {
  const fallback = fallbackMetrics[index % fallbackMetrics.length]
  return {
    title: element.title ?? fallback.title,
    value: element.value ?? fallback.value,
    change: element.change ?? fallback.change,
    color: element.color ?? fallback.color,
  }
}

function MetricCard({ element, index }: { element: ReactRenderElement; index: number }) {
  const metric = metricData(element, index)
  const colors = colorClasses(metric.color)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-black/[0.02]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{metric.title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">{metric.value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.soft} ${colors.text} ring-4 ${colors.ring}`}>
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors.soft} ${colors.text}`}>
          {metric.change}
        </span>
        <span className="text-xs font-medium text-slate-400">vs last month</span>
      </div>
    </article>
  )
}

function ChartCard({ title }: { title?: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{title ?? 'Revenue Trend'}</h3>
          <p className="mt-1 text-sm text-slate-500">Performance across the last 8 periods</p>
        </div>
        <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1 text-xs font-medium text-slate-500">
          <span className="rounded bg-white px-2 py-1 text-slate-900 shadow-sm">Month</span>
          <span className="px-2 py-1">Year</span>
        </div>
      </div>
      <div className="mt-6 flex h-56 items-end gap-3 border-b border-l border-slate-200 px-4 pb-4">
        {chartBars.map((height, index) => (
          <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400"
              style={{ height: `${height}%` }}
            />
            <span className="text-[11px] font-medium text-slate-400">{`W${index + 1}`}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function TableCard({ title }: { title?: string }) {
  const rows = [
    ['Acme Co.', 'Enterprise', '$12,400', 'Won'],
    ['Northstar', 'Growth', '$8,920', 'Review'],
    ['Orbit Labs', 'Starter', '$3,180', 'Active'],
    ['LinearWorks', 'Enterprise', '$18,750', 'Renewal'],
  ]

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-950">{title ?? 'Recent Accounts'}</h3>
        <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
          View all
        </button>
      </div>
      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Value</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td key={cell} className={`px-4 py-3 ${index === 0 ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function GenericCard({ element, index }: { element: ReactRenderElement; index: number }) {
  const colors = colorClasses(element.color)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 h-10 w-10 rounded-lg ${colors.bg}`} />
      <h3 className="text-base font-semibold text-slate-950">
        {element.title ?? fallbackMetrics[index % fallbackMetrics.length].title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Clean generated content with editable sections, balanced spacing, and production-ready hierarchy.
      </p>
    </article>
  )
}

function ContentItem({ element, index }: { element: ReactRenderElement; index: number }) {
  const semantic = inferVisualKind(element, index)

  if (semantic === 'metric-card' || semantic === 'widget_timer' || semantic === 'card') {
    return <MetricCard element={element} index={index} />
  }

  if (semantic === 'chart' || semantic === 'widget_chart' || semantic === 'content_image') {
    return <ChartCard title={element.title} />
  }

  if (semantic === 'table' || semantic === 'widget_tasks') {
    return <TableCard title={element.title} />
  }

  return <GenericCard element={element} index={index} />
}

function inferVisualKind(element: ReactRenderElement, index: number) {
  const semantic = semanticOf(element)
  const id = element.id.toLowerCase()
  const bbox = element.bbox
  const w = bbox?.w ?? ((element.span ?? 3) / 12)
  const h = bbox?.h ?? ((element.rowSpan ?? 2) / 8)
  const isGenericSemantic = semantic === 'block' || semantic === 'unknown' || semantic === 'card' || semantic === 'section'

  if (!isGenericSemantic) return semantic
  if (id.includes('sidebar') || (w <= 0.24 && h >= 0.45) || element.span === 2) return 'sidebar'
  if (id.includes('header') || (w >= 0.45 && h <= 0.18) || element.rowSpan === 1) return 'header'
  if (id.includes('chart') || (w >= 0.48 && h >= 0.28) || (element.span ?? 1) >= 8) return 'chart'
  if (id.includes('table') || (w >= 0.55 && h >= 0.22) || (element.rowSpan ?? 1) >= 3) return 'table'
  if (index < 4) return 'metric-card'
  return 'card'
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(1, value))
}

function elementLayoutStyle(element: ReactRenderElement): React.CSSProperties {
  if (element.bbox) {
    const x = clampPercent(element.bbox.x)
    const y = clampPercent(element.bbox.y)
    const width = Math.max(0.04, Math.min(element.bbox.w, 1 - x))
    const height = Math.max(0.04, Math.min(element.bbox.h, 1 - y))

    return {
      position: 'absolute',
      left: `${x * 100}%`,
      top: `${y * 100}%`,
      width: `${width * 100}%`,
      height: `${height * 100}%`,
    }
  }

  return {
    gridColumn: `${Math.max(1, element.col ?? 1)} / span ${Math.max(1, Math.min(12, element.span ?? 3))}`,
    gridRow: `${Math.max(1, element.row ?? 1)} / span ${Math.max(1, element.rowSpan ?? 2)}`,
  }
}

function HeaderPanel({ element }: { element: ReactRenderElement }) {
  return (
    <section className="flex h-full min-h-0 items-center justify-between overflow-hidden rounded-lg border border-white/70 bg-white/95 px-6 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.03]">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-normal text-blue-600">Workspace overview</p>
        <h1 className="mt-1 truncate text-2xl font-semibold text-slate-950">{element.title ?? 'Executive Dashboard'}</h1>
        <p className="mt-1 truncate text-xs text-slate-500">Live product, revenue, and customer signals.</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">Export</button>
        <button className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/20">Share</button>
      </div>
    </section>
  )
}

function SidebarPanel() {
  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-950 p-4 text-white shadow-[0_22px_55px_rgba(2,6,23,0.22)]">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-sm font-black text-slate-950 shadow-sm">S</div>
        <div>
          <p className="text-sm font-semibold">Sketcho</p>
          <p className="text-xs text-slate-400">AI workspace</p>
        </div>
      </div>
      {['Dashboard', 'Analytics', 'Customers', 'Settings'].map((item, index) => (
        <div
          key={item}
          className={`mb-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${index === 0 ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-300'}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-slate-600'}`} />
          {item}
        </div>
      ))}
      <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.06] p-3">
        <p className="text-sm font-semibold">Design Health</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">Spacing, hierarchy, and component structure are ready for review.</p>
      </div>
    </aside>
  )
}

function SketchElementCard({ element, index }: { element: ReactRenderElement; index: number }) {
  const kind = inferVisualKind(element, index)

  if (kind === 'sidebar') return <SidebarPanel />
  if (kind === 'header' || kind === 'nav') return <HeaderPanel element={element} />
  if (kind === 'chart' || kind === 'media' || kind === 'content_image') return <SketchChartPanel title={element.title} />
  if (kind === 'table' || kind === 'widget_tasks') return <SketchTablePanel title={element.title} />
  if (kind === 'metric-card' || kind === 'widget_timer') return <SketchMetricPanel element={element} index={index} />

  return <SketchGenericPanel element={element} index={index} />
}

function SketchMetricPanel({ element, index }: { element: ReactRenderElement; index: number }) {
  const metric = metricData(element, index)
  const colors = colorClasses(metric.color)

  return (
    <article className="flex h-full min-h-0 flex-col justify-between overflow-hidden rounded-lg border border-white/80 bg-white p-4 shadow-[0_16px_38px_rgba(15,23,42,0.07)] ring-1 ring-slate-900/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-500">{metric.title}</p>
          <p className="mt-1 truncate text-2xl font-semibold text-slate-950">{metric.value}</p>
        </div>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${colors.soft} ${colors.text} ring-4 ${colors.ring}`}>
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <span className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ${colors.soft} ${colors.text}`}>
          {metric.change}
        </span>
        <div className="flex h-8 flex-1 items-end justify-end gap-1">
          {[32, 52, 41, 66, 58, 74].map((height, barIndex) => (
            <span
              key={barIndex}
              className="w-1.5 rounded-t bg-slate-200"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </article>
  )
}

function SketchChartPanel({ title }: { title?: string }) {
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-white/80 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.03]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-950">{title ?? 'Performance'}</h3>
          <p className="truncate text-xs text-slate-500">Trend generated from this region of the sketch</p>
        </div>
        <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-500">
          <span className="rounded bg-white px-2 py-1 text-slate-900 shadow-sm">Month</span>
          <span className="px-2 py-1">Year</span>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-end gap-3 rounded-md border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 pb-4 pt-6">
        <div className="absolute inset-x-4 top-1/4 border-t border-dashed border-slate-200" />
        <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-slate-200" />
        <div className="absolute inset-x-4 top-3/4 border-t border-dashed border-slate-200" />
        {chartBars.map((height, index) => (
          <div
            key={index}
            className="relative z-10 flex-1 rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 shadow-sm"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </article>
  )
}

function SketchTablePanel({ title }: { title?: string }) {
  return (
    <article className="h-full min-h-0 overflow-hidden rounded-lg border border-white/80 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.03]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="truncate text-base font-semibold text-slate-950">{title ?? 'Recent Activity'}</h3>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500">Live</span>
      </div>
      <div className="mt-4 space-y-2">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="grid grid-cols-[1fr_80px_64px] gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
            <span className="truncate font-medium text-slate-700">Account {row + 1}</span>
            <span className="truncate text-slate-500">${[1240, 892, 318, 1875][row]}</span>
            <span className="truncate font-semibold text-emerald-700">Active</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function SketchGenericPanel({ element, index }: { element: ReactRenderElement; index: number }) {
  const colors = colorClasses(element.color)

  return (
    <article className="h-full min-h-0 overflow-hidden rounded-lg border border-white/80 bg-white p-4 shadow-[0_16px_38px_rgba(15,23,42,0.07)] ring-1 ring-slate-900/[0.03]">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-md ${colors.bg} shadow-sm`}>
        <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
      </div>
      <h3 className="truncate text-sm font-semibold text-slate-950">
        {element.title ?? fallbackMetrics[index % fallbackMetrics.length].title}
      </h3>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
        Generated content sized to match this part of your sketch.
      </p>
      <div className="mt-4 space-y-2">
        <div className="h-2 rounded-full bg-slate-100" />
        <div className="h-2 w-3/4 rounded-full bg-slate-100" />
      </div>
    </article>
  )
}

function SketchDrivenScreen({ screen, elements }: { screen: ReactRenderScreen; elements: ReactRenderElement[] }) {
  const usesAbsolute = elements.some((element) => element.bbox)

  return (
    <main className="h-full overflow-hidden bg-[radial-gradient(circle_at_top_left,#f8fbff,#eef4fb_44%,#e9f0f8)] p-6 text-slate-950">
      <div
        className={usesAbsolute ? 'relative h-full w-full' : 'grid h-full w-full grid-cols-12 grid-rows-8 gap-4'}
      >
        {elements.map((element, index) => (
          <div key={element.id} className="min-h-0 overflow-hidden" style={elementLayoutStyle(element)}>
            <SketchElementCard element={element} index={index} />
          </div>
        ))}
      </div>
    </main>
  )
}

function DashboardScreen({ screen }: { screen: ReactRenderScreen }) {
  const header = headerCopy(screen)
  const elements = elementsFromScreen(screen)
  if (elements.length > 0 && hasSketchGeometry(elements)) {
    return <SketchDrivenScreen screen={screen} elements={elements} />
  }

  const contentElements = elements.length ? elements : fallbackMetrics.map((metric, index) => ({
    id: `fallback-${index}`,
    type: index === 3 ? 'chart' : 'metric-card',
    ...metric,
  }))

  return (
    <main className="flex min-h-full bg-slate-100 text-slate-950">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-950 p-5 text-white md:flex md:flex-col">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-black text-slate-950">
            S
          </div>
          <div>
            <p className="text-sm font-semibold">Sketcho</p>
            <p className="text-xs text-slate-400">AI workspace</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {navItems(screen).map((item, index) => (
            <a
              key={item.id ?? `${item.title}-${index}`}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
                index === 0 ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-slate-500'}`} />
              {item.title ?? `Section ${index + 1}`}
            </a>
          ))}
        </nav>
        <div className="mt-auto rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">Design Health</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Spacing, hierarchy, and component structure are ready for review.</p>
        </div>
      </aside>

      <section className="min-w-0 flex-1 p-5 md:p-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950 md:text-3xl">{header.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{header.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              Export
            </button>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              Share
            </button>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {contentElements.map((element, index) => (
            <ContentItem key={element.id ?? `${semanticOf(element)}-${index}`} element={element} index={index} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default function RenderReact({ screens }: RenderReactProps) {
  const screen = screens[0]

  if (!screen) {
    return null
  }

  return <DashboardScreen screen={screen} />
}
