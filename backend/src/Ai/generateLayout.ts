export async function generateLayout(prompt: string) {
  return [
    {
      type: "text",
      x: 80,
      y: 40,
      text: "Generated from AI"
    },
    {
      type: "card",
      x: 80,
      y: 100,
      spacing: "lg",
      title: "Smart Card",
      description: "AI-generated layout"
    }
  ]
}
