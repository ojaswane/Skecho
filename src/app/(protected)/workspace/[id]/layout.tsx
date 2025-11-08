import Navbar from '@/components/canvas/Navbar'
import React from 'react'
import Toolbar from '@/components/canvas/Toolbar'
import CanvasBoard from '@/components/canvas/Canvas'

type props = {
  children: React.ReactNode
}
const layout = ({ children }: props) => {
  return (
    <>
      <main className="flex flex-col h-screen">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <CanvasBoard />
        </div>
        <Toolbar />
      </main>
    </>
  )
}

export default layout