// this is the file which contains the Overlay above the frame
import React from 'react'
import { useCanvasStore } from '../../../lib/store/canvasStore'
import FramesOverlay from './options_pages/OverlayOption';
const FrameOverlays = () => {
  const frames = useCanvasStore((s) => s.frames);

  return (
    <>
      {frames.map((frame) => (
        <FramesOverlay frame={frame} key={frame.id} />
      ))}
    </>
  )
}

export default FrameOverlays