// this is a react render component for the canvas area
import {useState , useRef , useEffect} from 'react'
import { shape , ShapeType } from '../../../lib/type'
const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shapes , useShapes] = useState<shape[]>([])
  const [selectted , setSelected] =useState<shape | null>(null)
  const [isDragging , setIsDragging] = useState<{offsetX : number, offsetY : number }| null>(null)
  
  
  return (
    <>
    </>
  )
}

export default Canvas