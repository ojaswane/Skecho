"use client";
import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Sparkles } from 'lucide-react';

const ImageUploader: React.FC = () => {
    const [images, setImages] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = Array.from(e.dataTransfer.files);
        const imageFiles = droppedFiles.filter((file) =>
            file.type.startsWith("image/")
        );
        setImages((prev) => [...prev, ...imageFiles]);
    };

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
        setImages((prev) => [...prev, ...selectedFiles]);
    };

    const handleGenerateAI = () => {
        // Placeholder for AI image generation logic
        // alert("✨ AI image generation triggered!");
    };

    return (
        <div className="w-full mt-10 max-w-full flex flex-col  text-neutral-300 p-6 rounded-lg">
            {/* Drag & Drop Container */}
            <div
                className="w-full h-120 border-2 border-dashed border-neutral-600 rounded-lg flex flex-col justify-between p-4 text-neutral-400 text-base bg-gray-200 dark:bg-neutral-950 transition-colors hover:border-neutral-400"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {/* Image Preview or Placeholder */}
                <div className="flex-1 flex justify-center items-center overflow-y-auto">
                    {images.length === 0 ? (
                        <p>Drag and drop your images here</p>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-3">
                            {images.map((img, i) => (
                                <img
                                    key={i}
                                    src={URL.createObjectURL(img)}
                                    alt={`upload-${i}`}
                                    className="w-20 h-20 object-cover rounded-md"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Hidden File Input */}
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    hidden
                />

                {/* Buttons inside container at the bottom */}
                <div className="flex justify-end items-center gap-3 mt-4 ">
                    <button
                        className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-sm text-gray-200 rounded-md transition"
                        onClick={handleImportClick}
                    >
                        Import
                    </button>
                    <button
                        className="bg-black flex text-white dark:bg-white dark:text-black px-4 py-2 text-sm rounded-md transition"
                        onClick={handleGenerateAI}
                    >
                        <Sparkles className="w-5 h-5 mr-2 dark:text-black"/>
                        Generate using AI
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageUploader;
