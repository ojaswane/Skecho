import React from 'react'
import Historypill from '../ui/History/Historypill'
import ZoomBar from '../ui/zoom/ZoomPill'

const Toolbar = () => {
  return (
    <div className='fixed bottom-0 w-full grid grid-cols-3 z-50 p-5'>
      <Historypill />
      <ZoomBar/>
    </div>
  )
}

export default Toolbar