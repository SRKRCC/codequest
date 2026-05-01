import { memo } from "react"

export const Badge = memo(
  ({
    children,
    className = "",
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      role="status"
    >
      {children}
    </span>
  )
)
Badge.displayName = "Badge"