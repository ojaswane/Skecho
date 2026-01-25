import { radius } from "./radius";
import { color } from "./color";
import { typography } from "./typography";
import { spacing } from "./spacing";

const Tokens_for_ai = () => {
    return {
        ...radius,
        ...color,
        ...typography,
        ...spacing
    }
}

export default Tokens_for_ai