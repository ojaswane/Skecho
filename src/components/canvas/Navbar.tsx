import React from "react"
import Breadcrumbb from "../ui/breadcrumb/workspace/Breadcrumb"


const Navbar = () => {
  return (
    <div className="flex justify-between items-center px-8 py-4 mt-2 mx-2 backdrop-blur-xl border-2 dark:bg-white/5  dark:border-white/10 dark:text-neutral-300 bg-black/30  border-black/20 text-black rounded-2xl shadow-sm">

      {/* Left Side - Breadcrumb */}
      <div className="flex items-center space-x-2">
        <Breadcrumbb />
      </div>

      {/* Right Side - Credits / Export / Profile */}
      <div className="flex items-center space-x-4">
        right side
      </div>
    </div>
  )
}

export default Navbar
