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
  const semantic = semanticOf(element)

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

function DashboardScreen({ screen }: { screen: ReactRenderScreen }) {
  const header = headerCopy(screen)
  const elements = elementsFromScreen(screen)
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
  const screen = screens[0] ?? {
    id: 'preview-fallback',
    name: 'Generated Dashboard',
  }

  return <DashboardScreen screen={screen} />
}
