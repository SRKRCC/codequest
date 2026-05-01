import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import axios from "axios"
import { AnimatePresence, motion } from "framer-motion"
import { Award, ChevronLeft, ChevronRight, ChevronUp, Crown, Medal, Search, Trophy, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import SEO from "../SEO/SEO"

const USERS_PER_PAGE = 10

interface LeaderboardUser {
  username: string
  points: number
  rank: number
  streak: number
  lastSolvedAt?: string
  solveChallenges: {
    easy: number
    medium: number
    hard: number
    total: number
  }
  id: number
  _id: string
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [isDarkMode] = useState(false)
  const [updatedUser] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fetch data from backend with search and pagination
  const fetchLeaderboard = async (search: string, page: number) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/leaderboard`, {
        params: {
          search,
          page,
          limit: USERS_PER_PAGE
        }
      })
      setUsers(response.data.users)
      setTotalPages(response.data.totalPages)
      setTotalUsers(response.data.totalUsers)
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
      setUsers([])
      setTotalPages(1)
      setTotalUsers(0)
    }
  }

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchLeaderboard(searchTerm, 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch new page when currentPage changes
  useEffect(() => {
    fetchLeaderboard(searchTerm, currentPage)
  }, [currentPage])

  const clearSearch = () => {
    setSearchTerm("")
    if (searchInputRef.current) {
      searchInputRef.current.blur()
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />
      default:
        return <div className="h-5 w-5 flex items-center justify-center font-bold">{rank}</div>
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Pagination logic same as before, displaying page numbers intelligently
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 2) {
        endPage = 4
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3
      }

      if (startPage > 2) {
        pages.push("...")
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages - 1) {
        pages.push("...")
      }

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <>
      <SEO 
        title="Leaderboard | CodeQuest - Top Coders Rankings"
        description="Check out the CodeQuest leaderboard to see top performers, rankings, and coding achievements. Track your progress and compete with fellow coders."
        keywords="coding leaderboard, programming rankings, competitive programming, coding achievements, top coders"
      />
      <div
        className={cn(
          "min-h-screen transition-all duration-500 px-4 sm:px-6 md:px-12 lg:px-20 bg-background text-foreground",
          isDarkMode ? "dark" : "",
          "bg-grid-pattern"
        )}
      >
      <div className="container mx-auto p-1 px-2 sm:px-4 relative mt-6">
        {/* Header and search UI */}
        <div className="relative z-10 sm:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3">
                <motion.div
                  animate={{
                    rotate: [0, 5, 0, -5, 0],
                    y: [0, -5, 0, -5, 0]
                  }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5 }}
                >
                  <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-ring">
                    CodeQuest
                  </span>
                  <span className="ml-1 sm:ml-2 text-foreground">Leaderboard</span>
                </h1>
              </div>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base md:text-lg">
                Top problem solvers competing for glory
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full sm:w-auto mt-4 md:mt-0 md:ml-auto">
              <div
                className="relative flex items-center rounded-xl transition-all duration-300 w-full sm:w-72
                border border-gray-700 dark:border-indigo-300
                shadow-md shadow-indigo-700/30 dark:shadow-indigo-200/30
                bg-gray-800 dark:bg-white
                hover:border-indigo-500 dark:hover:border-indigo-400
                hover:shadow-lg hover:shadow-indigo-500/30 dark:hover:shadow-indigo-300/30"
              >
                <div className="pl-1">
                  <Search className="h-4 w-4 text-white dark:text-indigo-500 ml-2" />
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for coders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent py-2 sm:py-3 px-2 sm:px-3 outline-none transition-all duration-300
                      text-sm text-white dark:text-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />

                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="mr-2 sm:mr-3 p-1.5 rounded-full bg-indigo-600 dark:bg-indigo-500 transition-colors duration-300
                  hover:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    <X className="h-3.5 w-3.5 text-white dark:text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent mt-4 sm:mt-6 opacity-70 dark:via-indigo-400"></div>

          <AnimatePresence>
            {searchTerm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.1 }}
                className="text-center text-xs sm:text-sm mt-2 sm:mt-3 font-medium bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400"
              >
                {users.length === 0
                  ? "No coders found"
                  : users.length === 1
                  ? "1 coder found"
                  : `${totalUsers} coders found`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Leaderboard table (desktop) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className={cn(
            "overflow-hidden border-none shadow-xl transition-all duration-300 mt-0",
            isDarkMode ? "bg-card/80 backdrop-blur-sm border-border/30" : "bg-card/90 backdrop-blur-sm"
          )}
        >
          {/* Table header */}
          <div
            className={cn(
              "hidden sm:grid grid-cols-12 md:grid-cols-15 p-3 sm:p-4 font-medium border-b rounded-t-md text-xs sm:text-sm",
              isDarkMode ? "text-primary border-border bg-muted/30" : "text-primary border-border bg-muted/50"
            )}
          >
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5 ml-2 sm:ml-5">Coder</div>
            <div className="col-span-2 sm:col-span-3 text-center">Points</div>
            <div className="col-span-2 sm:col-span-3 text-center">Problems</div>
            <div className="col-span-2 sm:col-span-3 text-center">Streak</div>
          </div>

          {/* Mobile version */}
          <div className="sm:hidden divide-y">
            {users.map((user) => (
              <div key={user._id} className="flex flex-col p-3 text-sm hover:bg-accent/40 transition">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2">{getRankIcon(user.rank)} {user.username}</span>
                  <span className="text-chart-4 font-semibold">{user.points} pts</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table body */}
          <div className={cn("hidden sm:block divide-y rounded-b-md", isDarkMode ? "divide-border/20" : "divide-border/70")}>
            <AnimatePresence>
              {users.map((user) => {
                const isTop3 = user.rank <= 3
                const isUpdated = user.id === updatedUser
                return (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      backgroundColor: isUpdated
                        ? isDarkMode
                          ? "rgba(var(--primary), 0.2)"
                          : "rgba(var(--primary), 0.1)"
                        : "rgba(0, 0, 0, 0)",
                    }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
                    transition={{ duration: 0.4, type: "spring" }}
                    className={cn(
                      "hover:scale-100 grid grid-cols-15 p-4 items-center relative overflow-hidden hover:text-blue-500 hover:bg-accent/80 hover:-translate-y-1 hover:shadow-lg",
                      isTop3 ? (isDarkMode ? "bg-muted/30" : "bg-muted/80") : "",
                      "transition-all duration-300 cursor-pointer"
                    )}
                  >
                    <div className="col-span-1 flex justify-center">
                      <motion.div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full",
                          user.rank === 1
                            ? isDarkMode
                              ? "bg-chart-1/30"
                              : "bg-chart-1/20"
                            : user.rank === 2
                            ? isDarkMode
                              ? "bg-chart-2/30"
                              : "bg-chart-2/20"
                            : user.rank === 3
                            ? isDarkMode
                              ? "bg-chart-3/30"
                              : "bg-chart-3/20"
                            : isDarkMode
                            ? "bg-muted/30"
                            : "bg-muted/20"
                        )}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {getRankIcon(user.rank)}
                      </motion.div>
                    </div>

                    <Link to={`/profile/${user.username}`} className="col-span-5 flex items-center gap-3">
                      <motion.span
                        className={cn(
                          "font-medium ml-4 relative inline-block hover:text-blue-500",
                          isTop3 ? "text-lg ml-0" : "",
                          user.rank === 1
                            ? "text-chart-1 font-bold"
                            : user.rank === 2
                            ? "text-chart-2 font-bold"
                            : user.rank === 3
                            ? "text-chart-3 font-bold"
                            : ""
                        )}
                        whileHover={{
                          scale: 1.15,
                          textShadow: isDarkMode
                            ? "0 0 8px rgba(59, 130, 246, 0.8)"
                            : "0 0 8px rgba(59, 130, 246, 0.5)",
                        }}
                      >
                        {user.username}
                      </motion.span>
                    </Link>

                    <motion.div
                      className="col-span-3 text-center font-semibold"
                      key={`points-${user.id}-${user.points}`}
                      initial={{ scale: 1 }}
                      animate={{
                        scale: isUpdated ? [1, 1.2, 1] : 1,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {isUpdated && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={"hover:text-blue-500 text-chart-4"}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </motion.div>
                        )}
                        <div className={cn("transition-all duration-300 hover:text-blue-500 text-chart-4")}>
                          {user.points}
                        </div>
                      </div>
                    </motion.div>

                    <div className="col-span-3 text-center">
                      <div className="flex items-center justify-center gap-2 transition-all duration-300 hover:text-blue-500">
                        {user.solveChallenges ? user.solveChallenges.total : 0}
                      </div>
                    </div>

                    <div className="col-span-3 text-center">
                      <div className="flex items-center justify-center gap-2 transition-all duration-300 hover:text-blue-500">
                        <span>{user.streak}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Pagination footer */}
          {users.length > 0 && (
            <div
              className={cn(
                "p-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3",
                isDarkMode ? "border-border/20" : "border-border"
              )}
            >
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                {searchTerm
                  ? `Showing ${users.length} of ${totalUsers} results`
                  : `Page ${currentPage} of ${totalPages}`}
              </div>

              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : isDarkMode
                      ? "hover:bg-accent/50 text-primary"
                      : "hover:bg-accent/80 text-primary"
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>

                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => typeof page === "number" && goToPage(page)}
                      disabled={page === "..."}
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 text-xs sm:text-sm font-medium",
                        page === currentPage
                          ? isDarkMode
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                            : "bg-primary text-primary-foreground shadow-md"
                          : page === "..."
                          ? "cursor-default"
                          : isDarkMode
                          ? "hover:bg-accent/50 text-foreground"
                          : "hover:bg-accent/80 text-foreground",
                        page === currentPage && "transform scale-110"
                      )}
                    >
                      {page}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : isDarkMode
                      ? "hover:bg-accent/50 text-primary"
                      : "hover:bg-accent/80 text-primary"
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
    </>
  )
}
