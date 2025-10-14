'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { supabase } from '@/lib/supabaseclient' // adjust path to your client
import DrawerComponent from '@/components/ui/Drawer/Drawercomponent'
import {ThemeToggleButton } from '@/components/ui/skiper-ui/Skiper26'


export function SidebarComponent() {
    const [user, setUser] = useState<{ name: string | null; email: string | null } | null>(null)

    // ✅ Fetch the current user from Supabase
    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser()
            if (error) {
                console.error('Error fetching user:', error.message)
                return
            }
            if (data.user) {
                setUser({
                    name: data.user.user_metadata.full_name || 'User',
                    email: data.user.email ?? null,
                })
            }
        }

        fetchUser()
    }, [])

    return (
        <SidebarProvider>
            {/* Sidebar menu (collapsible) */}
            <AppSidebar />

            {/* Main content area beside sidebar */}
            <SidebarInset>
                {/* HEADER */}
                <header className="flex h-16 items-center justify-between border-b px-4">
                    {/* LEFT - Sidebar toggle */}
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="h-6" />
                        <h1 className="text-lg font-semibold">Dashboard</h1>
                    </div>


                    <div className="flex items-center gap-4">
                        {/* theme toggler */}
                        <ThemeToggleButton variant="circle-blur" start="top-right" blur />

                        {/* Drawer or Add button */}
                        <Button className=' bg-transparent hover:bg-transparent'>
                            <DrawerComponent />
                        </Button>

                    </div>
                </header>

                {/* MAIN CONTENT */}
                <main className="flex flex-1 flex-col gap-4 p-4">
                    <div className="bg-muted/50 flex-1 rounded-xl min-h-[80vh] flex items-center justify-center text-sm text-muted-foreground">
                        Your dashboard content goes here
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
