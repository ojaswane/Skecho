"use client"

import React, { useState, useEffect, DragEvent } from "react"
import { supabase } from "../../../lib/supabaseclient"
import { Loader2, Upload, Trash2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ImageUploader() {
    const [images, setImages] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    // ✅ Fetch stored images on mount
    useEffect(() => {
        const fetchImages = async () => {
            const { data, error } = await supabase
                .from("moodboard_images")
                .select("url")
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Error fetching images:", error.message, error.details, error.hint);
            }
            else {
                setImages(data.map((item) => item.url))
            }
        }

        fetchImages()
    }, [])

    // ✅ Upload files to Supabase Storage and store URLs in database
    const uploadFiles = async (files: FileList | File[]) => {
        setLoading(true)
        const uploadedUrls: string[] = []

        for (const file of Array.from(files)) {
            const fileName = `${Date.now()}-${file.name}`

            // Upload to Supabase storage
            const { error: uploadError } = await supabase.storage
                .from("moodboard-images")
                .upload(fileName, file)

            if (uploadError) {
                console.error("Upload error:", uploadError.message)
                continue
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from("moodboard-images")
                .getPublicUrl(fileName)

            const publicUrl = publicUrlData?.publicUrl
            if (publicUrl) {
                uploadedUrls.push(publicUrl)

                // Insert URL into database
                const { error: dbError } = await supabase
                    .from("moodboard_images")
                    .insert({ url: publicUrl })

                if (dbError) console.error("Database insert error:", dbError.message, dbError.details, dbError.hint);
            }
        }

        setImages((prev) => [...uploadedUrls, ...prev])
        setLoading(false)
    }

    // ✅ Handle file input
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) uploadFiles(files)
    }

    // ✅ Handle drag & drop
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const files = e.dataTransfer.files
        if (files.length > 0) uploadFiles(files)
    }

    // ✅ Delete image from both state + database
    const removeImage = async (url: string) => {
        setImages((prev) => prev.filter((img) => img !== url))

        const { error } = await supabase
            .from("moodboard_images")
            .delete()
            .eq("url", url)

        if (error) console.error("Error deleting image:", error)
    }

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
            ) : images.length > 0 ? (
                <div className="w-full flex flex-col items-center">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                        {images.map((url) => (
                            <div key={url} className="relative group">
                                <img
                                    src={url}
                                    alt="Moodboard Preview"
                                    className="rounded-xl shadow-lg max-h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <button
                                    onClick={() => removeImage(url)}
                                    className="absolute top-2 right-2 bg-black/60 p-1 rounded-full hover:bg-red-500 transition"
                                >
                                    <Trash2 className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <label
                            htmlFor="fileInput"
                            className="cursor-pointer bg-white text-black rounded-full px-5 py-2 font-medium hover:bg-gray-200 transition"
                        >
                            Add More
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileInput}
                            className="hidden"
                            id="fileInput"
                        />
                        <Button
                            onClick={() => console.log("Send to AI →", images)}
                            className="bg-white cursor-pointer text-black hover:bg-gray-200"
                        >
                            {loading ? (
                                "Generating..."
                            ) : (
                                <div className="flex items-center">
                                    <Sparkles className="mr-2" />
                                    Generate using AI
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <Upload className="w-10 h-10 text-gray-400 mb-4" />
                    <p className="text-gray-300 font-medium mb-2">
                        Drag & drop your designs here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        or click to upload multiple images
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                        id="fileInput"
                    />
                    <label
                        htmlFor="fileInput"
                        className="cursor-pointer bg-white text-black rounded-full px-5 py-2 font-medium hover:bg-gray-200 transition"
                    >
                        Upload Images
                    </label>
                </>
            )}
        </div>
    )
}