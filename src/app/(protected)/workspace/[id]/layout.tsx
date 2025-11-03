import Navbar from '@/components/canvas/Navbar'
import React from 'react'


type props = { 
    children: React.ReactNode
}
const layout = ({children}: props) => {
  return (
    <>
        <div className=''>
            <Navbar />
        </div>
    </>
  )
}

export default layout