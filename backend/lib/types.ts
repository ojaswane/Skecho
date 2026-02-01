import type { ForwardRefExoticComponent, RefAttributes } from "react"
import type { LucideProps } from "lucide-react"

export type SemanticVisualRule = {
    shape: "pill" | "circle" | "rect"

    /* layout */
    height?: number
    size?: number
    widthPercent?: number
    marginBottom?: number
    gap?: number
    repeat?: number

    /* visuals (optional) */
    Icon?: ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >
}



export type SemanticBlock = {
    id: string
    kind:
    | "profile_image"
    | "content_image"
    | "title_text"
    | "body_text"
    | "meta_text"
    | "primary_action"
}

export type LaidOutBlock = {
    id: string
    left: number
    top: number
    width: number
    height: number
    rule: SemanticVisualRule
}
