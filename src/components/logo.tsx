import React from "react"

export function LogoIcon({ className }: { className?: string }) {
  return (
    <div
      className={className}
      aria-label="Skecho"
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "linear-gradient(135deg, #6366F1 0%, #22C55E 100%)",
      }}
    />
  )
}

