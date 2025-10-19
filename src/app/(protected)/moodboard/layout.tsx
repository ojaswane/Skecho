import { Component, Hash, Type } from 'lucide-react'
import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SidebarComponent } from '@/components/ui/sidebarComponent/sidebar'

type props = {
    children: React.ReactNode
}


// writting the tabs
const tabs = [
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

const layout = ({ children }: props) => {
    return (
        <Tabs defaultValue="colour" className="w-full h-full flex flex-col gap-6">
            <SidebarComponent title="Moodboard">
                <div className="space-y-4 text-center">
                    {/* <Breadcrumb>
                      <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
                      <span className="mx-2">/</span>
                      <Link href="/moodboard" className="text-blue-600 hover:underline">Moodboard</Link>
                    </Breadcrumb> */}
                    {/* Heading */}
                    <div>
                        <h2 className="text-5xl font-semibold">Moodboard</h2>
                        <p>Upload your designs and get the whole style guide</p>
                    </div>
                </div>
                <TabsList className="grid w-full sm:w-fit h-auto grid-cols-2 rounded-full backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] saturate-150 p-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="flex items-center gap-3  rounded-xl data-[state=active]:backdrop-blur-xl data-[state=active]:bg-white/[0.15] data-[state=active]:border data-[state=active]:border-white/[0.12] transition-all duration-200 text-xs sm:text-sm"
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.value}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </SidebarComponent>
        </Tabs>
    );
};


export default layout