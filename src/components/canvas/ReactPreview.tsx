'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as fabric from 'fabric'
import RenderReact, { type ReactRenderScreen } from '@/lib/canvas/RenderReact'

type PreviewFrame = {
  left: number
  top: number
  width: number
  height: number
}

type ReactPreviewProps = {
  canvas: fabric.Canvas
  frame: PreviewFrame
  screens: ReactRenderScreen[]
  visible: boolean
}

function canvasToScreen(canvas: fabric.Canvas, x: number, y: number) {
  const vpt = canvas.viewportTransform
  if (!vpt) return { x, y }

  return {
    x: x * vpt[0] + vpt[4],
    y: y * vpt[3] + vpt[5],
  }
}

export default function ReactPreview({ canvas, frame, screens, visible }: ReactPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    if (!canvas) return
    const update = () => forceUpdate((value) => value + 1)

    canvas.on('after:render', update)
    canvas.on('mouse:wheel', update)
    canvas.on('object:moving', update)
    canvas.on('object:scaling', update)

    return () => {
      canvas.off('after:render', update)
      canvas.off('mouse:wheel', update)
      canvas.off('object:moving', update)
      canvas.off('object:scaling', update)
    }
  }, [canvas])

  useEffect(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!iframe || !doc) return

    doc.open()
    doc.write('<!doctype html><html><head></head><body><div id="react-preview-root"></div></body></html>')
    doc.close()

    const head = doc.head
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      head.appendChild(node.cloneNode(true))
    })

    const body = doc.body
    body.className = 'm-0 h-full overflow-hidden bg-slate-100 antialiased'
    doc.documentElement.className = 'h-full'
    doc.getElementById('react-preview-root')?.classList.add('h-full')
    setIframeBody(doc.getElementById('react-preview-root'))
  }, [])

  if (!visible) return null

  const zoom = canvas.getZoom()
  const pos = canvasToScreen(canvas, frame.left, frame.top)

  return (
    <div
      className="absolute pointer-events-auto overflow-hidden rounded-md border border-blue-500/40 bg-white shadow-2xl"
      style={{
        left: pos.x,
        top: pos.y,
        width: frame.width,
        height: frame.height,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        zIndex: 30,
      }}
    >
      <iframe
        ref={iframeRef}
        title="Sketcho React preview"
        className="h-full w-full border-0 bg-white"
        sandbox="allow-same-origin"
      />
      {iframeBody
        ? createPortal(
            <div className="h-full w-full overflow-hidden">
              <RenderReact screens={screens} />
            </div>,
            iframeBody
          )
        : null}
    </div>
  )
}
