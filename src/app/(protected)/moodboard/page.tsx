'use client'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { SidebarComponent } from '@/components/ui/sidebarComponent/sidebar'
import Link from 'next/link'
import React from 'react'
// import { SidebarComponent } from '@/components/layout/SidebarComponent'
// import { Breadcrumb } from '@/components/breadcrumb/breadcrumb'

export default function MoodboardPage() {
  return (
    <SidebarComponent title="Moodboard">
      <div className="space-y-4">
        <Breadcrumb>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link href="/moodboard" className="text-blue-600 hover:underline">Moodboard</Link>
        </Breadcrumb>
        <h2 className="text-2xl font-semibold">Moodboard Page</h2>
        <p>This is where your moodboard content goes!</p>
      </div>
    </SidebarComponent>
  )
}
