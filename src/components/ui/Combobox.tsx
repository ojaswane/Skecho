"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useCanvasStore } from "../../../lib/store/canvasStore"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { loadGoogleFont } from "../canvas/data/Fontfamily"

import { ALL_FONTS } from "../canvas/data/Fontfamily"
export function Combobox() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("Inter")


    const applyFonts = async (font: string) => {
        const canvas = useCanvasStore.getState().canvas
        const obj = canvas?.getActiveObject()

        if (!obj) return

        // Ensure it's a text object
        if (
            obj.type !== "text" &&
            obj.type !== "i-text" &&
            obj.type !== "textbox"
        ) {
            return
        }

        const textObj = obj as fabric.Text

        loadGoogleFont(font)

        // wait till you are ready
        await document.fonts.ready

        const fontsetted = textObj.set({ fontFamily: font });
        console.log(`Font setted as ${fontsetted}`)
        canvas?.renderAll()

        useCanvasStore.getState().setSelectedObject(textObj)
    }


    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="
            mt-1 w-43 h-10
            bg-white/10 border border-white/20
            rounded-md px-2
            focus:outline-none focus:ring-1 focus:ring-white/40
            flex justify-between
          "
                >
                    {value || "Select font"}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[220px] p-0">
                <Command>
                    <CommandInput placeholder="Search Fonts..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No Font found.</CommandEmpty>

                        <CommandGroup>
                            {ALL_FONTS.map((font: string) => (
                                <CommandItem
                                    key={font}
                                    value={font}
                                    style={{ fontFamily: font }}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue)
                                        setOpen(false)
                                        applyFonts(currentValue)
                                    }}
                                    defaultValue="Arial"
                                >
                                    {font}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === font ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}