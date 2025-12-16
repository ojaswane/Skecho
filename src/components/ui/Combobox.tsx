"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

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

import { ALL_FONTS } from "../canvas/data/Fontfamily"
export function Combobox() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

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
                        p-2
                        cursor-pointer
                         flex justify-between
                        "
                >
                    {value
                        ? ALL_FONTS.find((font) => font === value)
                        : "Arial"}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search Fonts..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No Font found.</CommandEmpty>
                        <CommandGroup>
                            {ALL_FONTS.map((font: string) => (
                                <CommandItem
                                    key={font}
                                    value={font}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
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