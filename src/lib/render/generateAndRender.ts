import { resolvePresetToCanvas } from "../design-systems/resolver/resolverPresetToCanvas"
import { minimalSaasPreset } from "../design-systems/presets/minimal-Saas"
import { defaultSaasPreset } from "../design-systems/presets/default-Saas"

export async function generateAndRender(canvas: fabric.Canvas, prompt: string) {
    const res = await fetch("/api/generate-wireframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
    })

    const { presetId, layout } = await res.json()

    const presetMap = {
        default_saas: defaultSaasPreset,
        minimal_saas: minimalSaasPreset
    }

    const preset = presetMap[presetId as keyof typeof presetMap] ?? defaultSaasPreset

    canvas.clear()

    resolvePresetToCanvas({
        canvas: canvas as any,
        preset,
        layout
    })
}
