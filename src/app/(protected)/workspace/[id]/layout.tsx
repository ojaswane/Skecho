import Navbar from '@/components/canvas/Navbar'
import React from 'react'
import Toolbar from '@/components/canvas/Toolbar'

type props = { 
    children: React.ReactNode
}
const layout = ({children}: props) => {
  return (
    <>
        <div className=''>
            <Navbar />
            <Toolbar /> 
        </div>
    </>
  )
}

export default layout