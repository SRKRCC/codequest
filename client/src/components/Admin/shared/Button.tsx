import { memo } from "react"

export const Button = memo(
  ({
    children,
    onClick,
    className = "",
    variant = "default",
    disabled = false,
    size,
  }: {
    children: React.ReactNode
    onClick?: () => void
    className?: string
    variant?: "default" | "outline"
    disabled?: boolean
    size?: "default" | "icon" | "sm" | "lg"
  }) => {
    const sizeStyles = {
      default: "px-4 py-2",
      icon: "p-2",
      sm: "px-3 py-1",
      lg: "px-6 py-3"
    }
    const baseStyles =
      `${sizeStyles[size || "default"]} rounded-md font-medium transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500`
    const variantStyles =
      variant === "default"
        ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
        : "bg-transparent border border-gray-600 dark:border-gray-300 hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900"
    const disabledStyles = disabled
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer"

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className}`}
        aria-disabled={disabled}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"