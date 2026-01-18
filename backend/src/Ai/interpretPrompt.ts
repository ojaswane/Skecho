// backend/src/ai/interpretPrompt.ts

type UIElement = {
  type: string
  role?: string
}

export function interpretPrompt(prompt: string): UIElement[] {
  const lower = prompt.toLowerCase()

  if (lower.includes("login")) {
    return [
      { type: "input", role: "email" },
      { type: "input", role: "password" },
      { type: "button", role: "submit" }
    ]
  }

  if (lower.includes("signup") || lower.includes("register")) {
    return [
      { type: "input", role: "name" },
      { type: "input", role: "email" },
      { type: "button", role: "register" }
    ]
  }

  return []
}
