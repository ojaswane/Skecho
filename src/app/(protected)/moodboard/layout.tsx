import React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SidebarComponent } from "@/components/ui/sidebarComponent/sidebar"
import { Component, Hash, Type } from "lucide-react"

type Props = { children: React.ReactNode }

export default function Layout({ children }: Props) {
    return (
        <Tabs defaultValue="canvas" className="w-full h-full flex flex-col gap-6">
            <SidebarComponent title="Moodboard">


                <div className="opacity-100">
                    <h2 className="text-5xl font-semibold">Moodboard</h2>
                    <p className="mt-2 text-xl">Upload your designs and get the whole style guide</p>
                </div>

                <div className="container mx-auto px-4 sm:px-6 sm:py-8">
                    {children}
                </div>
            </SidebarComponent>
        </Tabs>
    )
}