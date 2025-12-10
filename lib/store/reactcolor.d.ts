declare module "react-color" {
    import * as React from "react";
    export interface SketchPickerProps {
        color: string | { r: number; g: number; b: number; a?: number };
        onChange?: (color: any) => void;
        onChangeComplete?: (color: any) => void;
        disableAlpha?: boolean;
        presetColors?: string[];
        width?: string | number;
        styles?: { [key: string]: React.CSSProperties };
    }
    export class SketchPicker extends React.Component<SketchPickerProps> { }
}