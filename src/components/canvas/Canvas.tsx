'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric'
import { useCanvasStore } from '../../../lib/store/canvasStore'
import FrameOverlays from './FrameOverlays'
import type { Frame } from '../../../lib/store/canvasStore'
import SelectionOverlay from './SelectionOverlay'


const CanvasRender = ({ theme }: { theme: 'light' | 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const { setCanvas: setStoreCanvas, setSelectedObject } = useCanvasStore()
  /* =========================
    CANVAS INIT
  ========================= */

  useEffect(() => {
    if (!canvasRef.current || canvas) return

    const c = new fabric.Canvas(canvasRef.current, {
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      selection: true
    })
    c.setWidth(window.innerWidth)
    c.setHeight(window.innerHeight - 120)

    setCanvas(c)
    setStoreCanvas(c as any)

    const applyOverlayVignette = (t: 'light' | 'dark') => {
      const h = c.getHeight()
      const strength = t === 'dark' ? 0.18 : 0.08
      c.overlayColor = new fabric.Gradient({
        type: 'linear',
        gradientUnits: 'pixels',
        coords: { x1: 0, y1: 0, x2: 0, y2: h },
        colorStops: [
          { offset: 0, color: `rgba(0,0,0,${strength})` },
          { offset: 0.8, color: `rgba(0,0,0,${strength * 0.4})` },
          { offset: 1, color: 'rgba(0,0,0,0)' },
        ],
      })
      c.requestRenderAll()
    }
    applyOverlayVignette(theme)

    // Delete key
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        const active = c.getActiveObject()
        if (active) {
          c.remove(active)
          c.requestRenderAll()
        }
      }
    }
    c.on('selection:created', e => {
      setSelectedObject(e.selected?.[0] || null)
    })

    c.on('selection:updated', e => {
      setSelectedObject(e.selected?.[0] || null)
    })

    c.on('selection:cleared', () => {
      setSelectedObject(null)
    })

    const preventBrowserZoomWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }

    const preventBrowserZoomKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('wheel', preventBrowserZoomWheel, { capture: true, passive: false })
    window.addEventListener('keydown', preventBrowserZoomKeys, { capture: true })

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', preventBrowserZoomWheel, { capture: true } as AddEventListenerOptions)
      window.removeEventListener('keydown', preventBrowserZoomKeys, { capture: true } as AddEventListenerOptions)
      c.dispose()
    }
  }, [])

  useEffect(() => {
    if (!canvas) return

    canvas.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff'
    const h = canvas.getHeight()
    const strength = theme === 'dark' ? 0.18 : 0.08
    canvas.overlayColor = new fabric.Gradient({
      type: 'linear',
      gradientUnits: 'pixels',
      coords: { x1: 0, y1: 0, x2: 0, y2: h },
      colorStops: [
        { offset: 0, color: `rgba(0,0,0,${strength})` },
        { offset: 0.8, color: `rgba(0,0,0,${strength * 0.4})` },
        { offset: 1, color: 'rgba(0,0,0,0)' },
      ],
    })
    canvas.requestRenderAll()

  }, [theme, canvas])

  /* =========================
      DEFAULT FRAME
  ========================= */

  useEffect(() => {
    if (!canvas) return
    const store = useCanvasStore.getState()
    if (store.frames.length > 0) return

    const id = crypto.randomUUID()
    const width = 1440
    const height = 1024

    const frame: Frame = {
      id,
      device: 'desktop',
      badge: 'Idea',
      width,
      height,
      left: canvas.getWidth() / 2 - width / 2,
      top: 80,
      locked: false,
      status: "idle",
      version: 0,
      lastPatchedAt: Date.now(),
    }

    // Frame border
    const frameRect = new fabric.Rect({
      left: frame.left,
      top: frame.top,
      width: frame.width,
      height: frame.height,
      fill: '#d9d9d9',
      stroke: '#888',
      strokeDashArray: [6, 6],
      selectable: true,
      evented: true,
      deletable: false,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: false,
      lockRotation: true,
    })

    frameRect.setControlsVisibility({
      mt: false,
      mb: true, // only scallable to the bottom
      ml: false,
      mr: false,
      bl: false,
      br: false,
      tl: false,
      tr: false,
      mtr: false,
    })

    canvas.on('object:scaling', e => {
      const obj = e.target as fabric.Object
      if (!obj || !obj.get('isFrame')) return // only frame is scalable

      const newHeight = obj.height! * obj.scaleY!

      obj.set({
        height: newHeight,
        scaleY: 1,
      })

      obj.setCoords()
      canvas.requestRenderAll()
    })

    frameRect.set('isFrame', true)
    frameRect.set('frameId', id)

    canvas.add(frameRect)
    store.addFrame(frame)

    canvas.requestRenderAll()
  }, [canvas])

  /* =========================
   FRAME CLIPPING 
========================= */


  useEffect(() => {
    if (!canvas) return

    const handler = (e: any) => {
      const obj = e.target as fabric.Object
      if (!obj || obj.get('isFrame')) return
      if (obj.type === 'activeSelection') return

      const center = obj.getCenterPoint()
      const frames = canvas.getObjects().filter(o => o.get('isFrame')) as fabric.Rect[]

      const targetFrame = frames.find(frame =>
        frame.containsPoint(center)
      )

      if (!targetFrame) {
        obj.set({
          isFrameContent: false,
          frameId: undefined,
        })
        return
      }

      obj.set({
        isFrameContent: true,
        frameId: targetFrame.get('frameId'),
      })
    }

    canvas.on('object:added', handler)
    canvas.on('object:moving', handler)

    return () => {
      canvas.off('object:added', handler)
      canvas.off('object:moving', handler)
    }
  }, [canvas])

  /* =========================
     ZOOM & PAN
  ========================= */

  useEffect(() => {
    if (!canvas) return

    // Smooth trackpad zoom/pan with eased zoom-to-cursor.
    let rafId: number | null = null
    let pendingPanX = 0
    let pendingPanY = 0
    let targetZoom = canvas.getZoom()
    let zoomAnchor: fabric.Point | null = null

    const clampZoom = (value: number) => Math.min(Math.max(value, 0.1), 6)

    const animateViewport = () => {
      rafId = null

      let needsNextFrame = false

      if (zoomAnchor) {
        const currentZoom = canvas.getZoom()
        const diff = targetZoom - currentZoom
        const nextZoom = Math.abs(diff) < 0.001
          ? targetZoom
          : currentZoom + diff * 0.22

        canvas.zoomToPoint(zoomAnchor, nextZoom)
        needsNextFrame = Math.abs(targetZoom - nextZoom) >= 0.001

        if (!needsNextFrame) {
          zoomAnchor = null
        }
      }

      if (Math.abs(pendingPanX) > 0.01 || Math.abs(pendingPanY) > 0.01) {
        const easedPanX = pendingPanX * 0.32
        const easedPanY = pendingPanY * 0.32

        canvas.relativePan(new fabric.Point(-easedPanX, -easedPanY))
        pendingPanX -= easedPanX
        pendingPanY -= easedPanY
        needsNextFrame = true
      } else {
        pendingPanX = 0
        pendingPanY = 0
      }

      canvas.requestRenderAll()

      if (needsNextFrame && rafId == null) {
        rafId = requestAnimationFrame(animateViewport)
      }
    }

    const scheduleViewportAnimation = () => {
      if (rafId == null) {
        rafId = requestAnimationFrame(animateViewport)
      }
    }

    const onWheel = (opt: any) => {
      const e = opt.e
      const deltaMode = e.deltaMode || 0
      const scale = deltaMode === 1 ? 16 : deltaMode === 2 ? 120 : 1
      const dx = (e.deltaX || 0) * scale
      const dy = (e.deltaY || 0) * scale

      if (e.ctrlKey || e.metaKey) {
        const p = canvas.getPointer(e)
        zoomAnchor = new fabric.Point(p.x, p.y)
        targetZoom = clampZoom(targetZoom * Math.exp(-dy * 0.0015))
      } else {
        const panSpeed = 0.7
        if (e.shiftKey) {
          pendingPanX += dy * panSpeed
        } else {
          pendingPanX += dx * panSpeed
          pendingPanY += dy * panSpeed
        }
      }

      scheduleViewportAnimation()

      e.preventDefault()
      e.stopPropagation()
    }

    canvas.on('mouse:wheel', onWheel)
    return () => {
      canvas.off('mouse:wheel', onWheel)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [canvas])


  // Vignette overlay is now rendered inside Fabric so it stays stable while zooming.

  return (
    <div className="relative w-full h-full overflow-hidden mt-5 flex justify-center items-start">
      <div className="rounded-2xl shadow-lg overflow-hidden vignette-effect" style={{ background: theme === 'dark' ? '#1a1a1a' : '#fff', position: 'relative', marginBottom: '0' }}>
        <canvas ref={canvasRef} style={{ borderRadius: '1rem', display: 'block' }} />
        <div className="absolute inset-0 pointer-events-none">
          <SelectionOverlay />
          <FrameOverlays />
        </div>
      </div>
    </div>
  )
}

export default CanvasRender
