"use client"

import React, { useState, DragEvent } from "react"
import { supabase } from "../../../lib/supabaseclient"
import { Loader2, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ImageUploader() {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const uploadFile = async (file: File) => {
        setLoading(true)
        const fileName = `${Date.now()}-${file.name}`

        const { data, error } = await supabase.storage
            .from("moodboard-images")
            .upload(fileName, file)

        if (error) {
            console.error(error)
            setLoading(false)
            return
        }

        const { data: publicUrl } = supabase.storage
            .from("moodboard-images")
            .getPublicUrl(fileName)

        setImageUrl(publicUrl.publicUrl)
        setLoading(false)
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) uploadFile(file)
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) uploadFile(file)
    }

    const removeImage = () => setImageUrl(null)

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border border-white/10 bg-neutral-900 rounded-2xl flex flex-col items-center justify-center p-10 text-center min-h-[400px] relative transition-all duration-300"
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-white w-8 h-8 mb-2" />
                    <p className="text-gray-400">Uploading...</p>
                </div>
            ) : imageUrl ? (
                <div className="relative w-full flex flex-col items-center">
                    <img
                        src={imageUrl}
                        alt="Moodboard Preview"
                        className="rounded-xl shadow-lg max-h-[350px] object-contain mb-4"
                    />
                    <div className="flex gap-3">
                        <Button onClick={removeImage} variant="secondary">
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                        <Button
                            onClick={() => console.log("Send to AI →", imageUrl)}
                            className="bg-white text-black hover:bg-gray-200"
                        >
                            ✨ Generate with AI
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <Upload className="w-10 h-10 text-gray-400 mb-4" />
                    <p className="text-gray-300 font-medium mb-2">
                        Drag & drop your design here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        or click to upload from your computer
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                        id="fileInput"
                    />
                    <label
                        htmlFor="fileInput"
                        className="cursor-pointer bg-white text-black rounded-full px-5 py-2 font-medium hover:bg-gray-200 transition"
                    >
                        Upload Image
                    </label>
                </>
            )}
        </div>
    )
}
