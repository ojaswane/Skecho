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
  const [previewRoot, setPreviewRoot] = useState<HTMLElement | null>(null)
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

  const mountIframeDocument = React.useCallback(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!iframe || !doc) return

    const head = doc.head
    head.innerHTML = ''
    const baseStyle = doc.createElement('style')
    baseStyle.textContent = `
      html, body, #react-preview-root { height: 100%; margin: 0; }
      body { overflow: hidden; background: #f1f5f9; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      * { box-sizing: border-box; }
    `
    head.appendChild(baseStyle)

    document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      head.appendChild(node.cloneNode(true))
    })

    const body = doc.body
    body.innerHTML = ''
    const root = doc.createElement('div')
    root.id = 'react-preview-root'
    root.className = 'h-full'
    body.appendChild(root)
    setPreviewRoot(root)
  }, [])

  useEffect(() => {
    if (!visible) return
    const id = window.setTimeout(mountIframeDocument, 0)
    return () => window.clearTimeout(id)
  }, [mountIframeDocument, visible])

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
        onLoad={mountIframeDocument}
      />
      {!previewRoot && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
          Loading React preview...
        </div>
      )}
      {previewRoot
        ? createPortal(
            <div className="h-full w-full overflow-hidden">
              <RenderReact screens={screens} />
            </div>,
            previewRoot
          )
        : null}
    </div>
  )
}
