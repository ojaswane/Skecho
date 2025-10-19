import React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SidebarComponent } from "@/components/ui/sidebarComponent/sidebar"
import { Component, Hash, Type } from "lucide-react"

type Props = { children: React.ReactNode }

export const tabs = [
    {
        value: "canvas",
        label: "Canvas",
        icon: Hash
    },
    {
        value: "style-guide",
        label: "Style Guide",
        icon: Type
    },
] as const

export default function Layout({ children }: Props) {
    return (
        <Tabs defaultValue="canvas" className="w-full h-full flex flex-col gap-6">
            <SidebarComponent title="Moodboard">
                <div className="flex flex-row justify-between items-center w-full p-10 mt-5">
                    <TabsContent
                        value="canvas"
                        className="transition-all duration-500 ease-in-out transform"
                    >
                        <div className="opacity-100">
                            <h2 className="text-5xl font-semibold">Moodboard</h2>
                            <p className="mt-2 text-xl">Upload your designs and get the whole style guide</p>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="style-guide"
                        className="transition-all duration-500 ease-in-out transform"
                    >
                        <div className="opacity-100">
                            <h2 className="text-5xl font-semibold">Style Guide</h2>
                            <p className="mt-2 text-xl">Get your deisgn information here</p>
                        </div>
                    </TabsContent>
                    
                    <TabsList className="grid w-full sm:w-fit h-auto grid-cols-2 rounded-full backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] saturate-150 p-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex items-center gap-3 cursor-pointer rounded-xl data-[state=active]:backdrop-blur-xl data-[state=active]:bg-white/[0.15] data-[state=active]:border data-[state=active]:border-white/[0.12] transition-all duration-200 text-xs sm:text-sm"
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                </div>
                <div className="container mx-auto px-4 sm:px-6 sm:py-8">
                    {children}
                </div>
            </SidebarComponent>
        </Tabs>
    )
}
