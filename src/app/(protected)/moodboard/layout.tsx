import { Component, Hash, Type } from 'lucide-react'
import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

type props ={
    children: React.ReactNode
}


// writting the tabs
const tabs = [
    {
        value: "colour",
        label: "Colour",
        icon: Hash
    },
    {
        value: "typography",
        label: "Typography",
        icon: Type
    },
    {
        value: "components",
        label: "Components",
        icon: Component
    }
] as const

const layout = ({children}: props) => {
  return (
    <Tabs>
        lkednlkn
    </Tabs>
  )
}

export default layout