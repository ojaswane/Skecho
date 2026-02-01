import { Images, CircleUser } from "lucide-react"
import { SemanticVisualRule } from "../../../lib/types"

// frame.blocks.forEach(block => {
//   const visual = SemanticVisualMap[block.semantic]

//   if (visual.shape === "circle") {
//     drawCircleAvatar()
//   }

//   if (visual.shape === "pill") {
//     drawRoundedRect()
//   }

//   if (visual.icon === "image") {
//     drawImageIcon()
//   }
// })

const SemanticVisualMap: Record<string, SemanticVisualRule> = {
    profile_image: {
        shape: "circle",
        size: 40,
        Icon: CircleUser
    },

    content_image: {
        shape: "rect",
        height: 120,
        Icon: Images
    },

    title_text: {
        shape: "pill",
        height: 18,
        widthPercent: 0.7
    },

    body_text: {
        shape: "pill",
        height: 14,
        widthPercent: 1,
        repeat: 2,
        gap: 6
    },

    meta_text: {
        shape: "pill",
        height: 10,
        widthPercent: 0.4
    },

    primary_action: {
        shape: "pill",
        height: 32,
        widthPercent: 0.4
    }
}

export default SemanticVisualMap
