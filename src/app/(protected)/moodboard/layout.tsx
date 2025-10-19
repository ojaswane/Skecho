import React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SidebarComponent } from "@/components/ui/sidebarComponent/sidebar"
import { Component, Hash, Type } from "lucide-react"

type Props = { children: React.ReactNode }

export default function Layout({ children }: Props) {
    return (
        <Tabs defaultValue="canvas" className="w-full h-full flex flex-col gap-6">
            <SidebarComponent title="Moodboard">


                <div className="flex flex-col w-full justify-center items-center text-center mb-6 mt-10 ">
                    <h2 className="tracking-tighter text-6xl font-semibold">Moodboard</h2>
                    <p className="mt-2 tracking-tighter opacity-90 text-2xl">Upload your designs and get the whole style guide</p>
                </div>

                <div className="container mx-auto px-4 sm:px-6 sm:py-8">
                    {children}
                </div>
            </SidebarComponent>
        </Tabs>
    )
}