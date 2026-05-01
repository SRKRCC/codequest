export interface Challenge {
  _id: string
  title: string
  createdAt: string
  category: string[]
  difficulty: "Easy" | "Medium" | "Hard"
  platform: string
  description: string
  problemLink: string
  solvedUsers: any[] // Using any[] temporarily - consider creating a User interface
  solvedPercentage?: number
  solvedUsersCount?: number
  totalUsers?: number
}

export interface Statistics {
  totalProblems: number
  averageSolveRate: number
  topPerformer: string
  lowestPerformer: string
}

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-emerald-900/50 text-emerald-500 border-emerald-500/60 dark:bg-emerald-500/20 dark:border-emerald-500/50"
    case "medium":
      return "bg-amber-900/50 text-amber-500 border-amber-500/60 dark:bg-amber-500/20 dark:border-amber-500/50"
    case "hard":
      return "bg-rose-900/50 text-rose-500 border-rose-500/60 dark:bg-rose-500/20 dark:border-rose-500/50"
    default:
      return "bg-gray-500/30 text-gray-500 border-gray-500/60 dark:bg-gray-500/20 dark:border-gray-500/50"
  }
}

export const formatDate = (dateString: string, format: "short" | "long" = "long") => {
  if (format === "short") {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}