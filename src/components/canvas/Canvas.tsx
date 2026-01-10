'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric'
import { useCanvasStore } from '../../../lib/store/canvasStore'
import FrameOverlays from './FrameOverlays'
import type { Frame } from '../../../lib/store/canvasStore'
import SelectionOverlay from './SelectionOverlay'

fabric.Object.prototype.hasBorders = false
fabric.Object.prototype.hasControls = false
fabric.Object.prototype.objectCaching = false

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

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      c.dispose()
    }
  }, [])

  useEffect(() => {
    if (!canvas) return

    canvas.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff'
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
      badge: 'idea',
      width,
      height,
      left: canvas.getWidth() / 2 - width / 2,
      top: 80,
      locked: false,
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
      selectable: false,
      evented: false,
    })

    frameRect.set('isFrame', true)
    frameRect.set('frameId', id)

    canvas.add(frameRect)

    // Frame content : clipped
    const clipGroup = new fabric.Group([], {
      left: frame.left,
      top: frame.top,
      width: frame.width,
      height: frame.height,
      selectable: true,
      evented: true,
    })

    clipGroup.clipPath = new fabric.Rect({
      left: frame.left,
      top: frame.top,
      width: frame.width,
      height: frame.height,
      absolutePositioned: true,
    })

    clipGroup.set('isFrame', true)
    clipGroup.set('isFrameContent', true)
    clipGroup.set('frameId', id)

    canvas.add(clipGroup)
    store.addFrame(frame)

    canvas.requestRenderAll()
  }, [canvas])

  /* =========================
     AUTO MOVE INTO FRAME
  ========================= */

  useEffect(() => {
    if (!canvas) return

    const handler = (e: any) => {
      const obj = e.target as fabric.Object
      if (obj.get('isFrame')) return
      if (obj.type === 'activeSelection') return

      const center = obj.getCenterPoint()

      const frames = canvas
        .getObjects()
        .filter(o => o.get('isFrameContent')) as fabric.Group[]

      const targetFrame = frames.find(frame =>
        frame.clipPath?.containsPoint(center)
      )

      if (targetFrame) {
        canvas.remove(obj)
        targetFrame.add(obj)
        obj.set('isFrameContent', true)
        obj.setCoords()
        targetFrame.setCoords()
        canvas.requestRenderAll()
      }
    }

    canvas.on('object:added', handler)
    return () => canvas.off('object:added', handler)
  }, [canvas])

  /* =========================
     ZOOM & PAN
  ========================= */

  useEffect(() => {
    if (!canvas) return

    const onWheel = (opt: any) => {
      const e = opt.e
      const delta = e.deltaY
      const zoom = canvas.getZoom()
      const vpt = canvas.viewportTransform!

      if (e.ctrlKey) {
        let newZoom = zoom * (delta > 0 ? 0.95 : 1.05)
        newZoom = Math.min(Math.max(newZoom, 0.1), 6)
        const p = canvas.getPointer(e)
        canvas.zoomToPoint(new fabric.Point(p.x, p.y), newZoom)
      } else if (e.shiftKey) {
        vpt[4] -= delta
      } else {
        vpt[5] -= delta
      }

      canvas.requestRenderAll()
      e.preventDefault()
      e.stopPropagation()
    }

    canvas.on('mouse:wheel', onWheel)
    return () => canvas.off('mouse:wheel', onWheel)
  }, [canvas])


  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} />
      <div className="absolute inset-0 pointer-events-none">
        <SelectionOverlay />
        <FrameOverlays />
      </div>
    </div>
  )
}

export default CanvasRender
