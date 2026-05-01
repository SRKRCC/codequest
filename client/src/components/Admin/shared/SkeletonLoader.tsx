import { memo } from "react"

export const SkeletonLoader = memo(() => (
  <div className="animate-pulse" aria-hidden="true">
    <div className="h-2 bg-gray-700 dark:bg-gray-300 rounded-t-lg w-full"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-700 dark:bg-gray-300 rounded w-3/4"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-700 dark:bg-gray-300 rounded w-1/4"></div>
        <div className="h-4 bg-gray-700 dark:bg-gray-300 rounded w-1/4"></div>
      </div>
    </div>
  </div>
))
SkeletonLoader.displayName = "SkeletonLoader"