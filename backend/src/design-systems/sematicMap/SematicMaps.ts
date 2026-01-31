import { Images } from 'lucide-react';
import { CircleUser } from 'lucide-react';

const SemanticVisualMap = {
    profile_image: {
        shape: "circle",
        size: "avatar",
        icon: "CircleUser"
    },

    content_image: {
        shape: "rect",
        aspect: "16:9",
        icon: "Images"
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
