'use client'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { SidebarComponent } from '@/components/ui/sidebarComponent/sidebar'
import Link from 'next/link'
import React from 'react'


export default function MoodboardPage() {
  return (
    <SidebarComponent title="Moodboard">
      <div className="space-y-4 text-center">
        {/* <Breadcrumb>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link href="/moodboard" className="text-blue-600 hover:underline">Moodboard</Link>
        </Breadcrumb> */}

        {/* THW HEADIONG PART */}
        <div>
          <h2 className="text-5xl font-semibold">Moodboard</h2>
          <p>Upload your designs and get the whole style guide</p>
        </div>
      </div>
    </SidebarComponent>
  )
}
