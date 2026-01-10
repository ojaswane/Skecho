// this is the file which contains the Overlay above the frame
import React, { useEffect } from 'react'
import { useCanvasStore } from '../../../lib/store/canvasStore'
import FramesOverlay from './options_pages/OverlayOption';
import DefaultText from './options_pages/FrameDefaultText';


const FrameOverlays = () => {
  const frames = useCanvasStore((s) => s.frames);


  return (
    <>
      {frames.map((frame) => (
        <FramesOverlay frame={frame} key={frame.id} />
      ))}
      <DefaultText />
    </>
  )
}

export default FrameOverlays