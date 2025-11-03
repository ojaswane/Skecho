import React from 'react'
import Historypill from '../ui/History/Historypill'

const Toolbar = () => {
  return (
    <div className='fixed bottom-0 w-full grid grid-cols-3 z-50 p-5'>
      <Historypill />
    </div>
  )
}

export default Toolbar