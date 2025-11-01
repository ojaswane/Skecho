import React from "react"
import { Breadcrumb } from "../ui/breadcrumb"

const Navbar = () => {
  return (
    <div className="flex justify-between items-center px-8 py-4 mt-2 mx-2 backdrop-blur-xl bg-white/70 dark:bg-neutral-900/50 rounded-2xl shadow-sm">
      
      {/* Left Side - Breadcrumb */}
      <div className="flex items-center space-x-2">
            <Breadcrumb/>
      </div>
  
      {/* Center - Tabs or Title */}
      <div className="flex items-center space-x-4">
        center
      </div>

      {/* Right Side - Credits / Export / Profile */}
      <div className="flex items-center space-x-4">
        right side
      </div>
    </div>
  )
}

export default Navbar
