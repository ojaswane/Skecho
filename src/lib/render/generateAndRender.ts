import { resolvePresetToCanvas } from "../design-systems/resolver/resolverPresetToCanvas"
import { minimalSaasPreset } from "../design-systems/presets/minimal-Saas"
import { defaultSaasPreset } from "../design-systems/presets/default-Saas"
import { glassNeonPreset } from "../design-systems/presets/glass-neon"
import { darkCinematicPreset } from "../design-systems/presets/dark-cinematic"
import { softPastelPreset } from "../design-systems/presets/soft-pastel"

export async function generateAndRender(canvas: fabric.Canvas, prompt: string) {
    const res = await fetch("/api/generate-wireframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
    })

    const { presetId, layout } = await res.json()

    const presetMap = {
        default_saas: defaultSaasPreset,
        minimal_saas: minimalSaasPreset,
        glass_neon: glassNeonPreset,
        dark_cinematic: darkCinematicPreset,
        soft_pastel: softPastelPreset
    }

    const preset = presetMap[presetId as keyof typeof presetMap] ?? defaultSaasPreset

    canvas.clear()

    resolvePresetToCanvas({
        canvas: canvas as any,
        preset,
        layout
    })
}
