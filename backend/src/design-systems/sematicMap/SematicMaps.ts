import { Images, CircleUser } from "lucide-react"

export function resolveWidth(width, cardWidth) {
    if (typeof width === "string" && width.endsWith("%")) {
        return (parseInt(width) / 100) * cardWidth
    }
    return width
}

const SemanticVisualMap = {
    profile_image: {
        shape: "circle",
        size: "avatar",
        Icon: CircleUser
    },

    content_image: {
        shape: "rect",
        aspect: "16:9",
        Icon: Images
    },

    title_text: {
        shape: "pill",
        height: "lg",
        width: "70%"
    },

    body_text: {
        shape: "pill",
        height: "md",
        width: "100%",
        repeat: 2
    },

    meta_text: {
        shape: "pill",
        height: "sm",
        width: "40%"
    },

    primary_action: {
        shape: "pill",
        height: "button",
        width: "40%"
    }
}

export default SemanticVisualMap
