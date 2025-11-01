"use client"

import React, { useState, useEffect } from "react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { useProjectStore } from "../../../../../lib/store/projectStore"
import { Input } from "@/components/ui/input"
import { useParams } from "next/navigation"
import toast from "react-hot-toast"

const Breadcrumbb = () => {
    const { id } = useParams()
    const { projects, updateProject } = useProjectStore()
    const project = projects.find((p) => p.id === id)

    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(project?.name || "Untitled Project")

    useEffect(() => {
        if (project) setName(project.name)
    }, [project])

    const handleBlur = async () => {
        setEditing(false)
        if (project && name.trim() !== project.name) {
            await updateProject(project.id, { name })
            toast.success("✅ Project name updated")
        }
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        {editing ? (
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={handleBlur}
                                onKeyDown={(e) => e.key === "Enter" && handleBlur()}
                                className="w-48 h-7 p-0  text-sm font-medium bg-transparent border-none focus-visible:ring-0"
                                autoFocus
                            />
                        ) : (
                            <span
                                className="text-sm font-medium hover:underline cursor-pointer"
                                onClick={() => setEditing(true)}
                            >
                                {name}
                            </span>
                        )}
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export default Breadcrumbb
