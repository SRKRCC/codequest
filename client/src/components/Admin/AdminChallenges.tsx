"use client";

import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Calendar,
  ChevronDown,
  Code,
  Filter,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Zap,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from "@/context/AdminContext";

// Interfaces
interface Challenge {
  _id: string;
  title: string;
  createdAt: string;
  category: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  platform: string;
  description: string;
  problemLink: string;
  solvedUsers: string[]; // Array of User ObjectIds
  solvedPercentage?: number;
  solvedUsersCount?: number;
  totalUsers?: number;
}

// interface Statistics {
//   totalProblems: number;
//   averageSolveRate: number;
//   topPerformer: string;
//   lowestPerformer: string;
// }

// Button Component
const Button = memo(
  ({
    children,
    onClick,
    className = "",
    variant = "default",
    disabled = false,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: "default" | "outline";
    disabled?: boolean;
  }) => {
    const baseStyles =
      "px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500";
    const variantStyles =
      variant === "default"
        ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
        : "bg-transparent border border-gray-600 dark:border-gray-300 hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900";
    const disabledStyles = disabled
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer";

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className}`}
        aria-disabled={disabled}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// Badge Component
const Badge = memo(
  ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      role="status"
    >
      {children}
    </span>
  )
);
Badge.displayName = "Badge";

// Input Component
const Input = memo(
  ({
    placeholder,
    value,
    onChange,
    className = "",
  }: {
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
  }) => (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-600 dark:border-gray-300 rounded-md bg-gray-800 dark:bg-white text-white dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-label={placeholder || "Input field"}
    />
  )
);
Input.displayName = "Input";

// Dropdown Component
const Dropdown = memo(
  ({
    trigger,
    items,
  }: {
    trigger: React.ReactNode;
    items: { label: string; onClick: () => void }[];
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          tabIndex={0}
        >
          {trigger}
        </div>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-gray-800 dark:bg-white rounded-md shadow-lg z-10 border border-gray-700 dark:border-gray-200"
            role="menu"
          >
            <div className="py-1">
              {items.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 text-sm text-gray-200 dark:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-100 cursor-pointer"
                  role="menuitem"
                  tabIndex={0}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }
);
Dropdown.displayName = "Dropdown";

// Animated Counter Component
const AnimatedCounter = memo(
  ({ value, duration = 0.5 }: { value: number; duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const end = value;
      const totalMilSecDur = duration * 1000;
      const incrementTime = totalMilSecDur / (end || 1);

      if (end === 0) {
        setCount(0);
        return;
      }

      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count}</span>;
  }
);
AnimatedCounter.displayName = "AnimatedCounter";

// Skeleton Loader Component
const SkeletonLoader = memo(() => (
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
));
SkeletonLoader.displayName = "SkeletonLoader";

const ProblemCard = memo(
  ({
    challenge,
    isToday = false,
    stats,
    onEdit,
    onDelete,
  }: {
    challenge: Challenge
    isToday?: boolean
    stats: { usersCount: number; challengesCount: number; solvedChallenges: number }
    onEdit: (challenge: Challenge) => void
    onDelete: (id: string) => void
  }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const navigate = useNavigate()

    const handleUpdatePOTD = useCallback(() => {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
      navigate("/codingclubadmin/addchallenge", {
        state: { fromAdmin: true },
      })
      toast.success("Redirected to AddChallenge page to view/update POTD!")
    }, [navigate])

    const handleDelete = async () => {
      if (window.confirm("Are you sure you want to delete this challenge?")) {
        setIsDeleting(true)
        await onDelete(challenge._id)
        setIsDeleting(false)
      }
    }

    const getDifficultyColor = useCallback((difficulty: string): string => {
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
    }, [])

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }

    const solvedPercentage =
      challenge.solvedUsersCount && stats.usersCount > 0 ? (challenge.solvedUsersCount / stats.usersCount) * 100 : 0

    return (
      <>
        <div className="overflow-hidden px-1">
          <div className="h-1 rounded-full overflow-hidden">
            <div
              style={{ width: `${solvedPercentage}%` }}
              className="h-2 bg-blue-600 dark:bg-blue-500"
              aria-label={`${solvedPercentage}% solved`}
            />
          </div>
        </div>

        <div className="mb-5 bg-gray-800 dark:bg-white shadow-lg overflow-hidden border border-gray-700 dark:border-gray-200 rounded-lg">
          <div className="p-6 mx-[0.5px] bg-gray-800 dark:bg-white rounded-b-lg">
            {isToday && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                  <h2 className="text-xl font-bold text-white dark:text-gray-900">Problem of the Day</h2>
                </div>
                <Button onClick={handleUpdatePOTD} disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-gray-900 mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Update POTD
                    </div>
                  )}
                </Button>
              </div>
            )}
            {isLoading ? (
              <SkeletonLoader />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-lg font-semibold text-white dark:text-gray-900 flex-1">{challenge.title}</h3>
                  {!isToday && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(challenge)}
                        className="p-2 hover:bg-gray-700 dark:hover:bg-gray-200 rounded-md transition-colors"
                        aria-label="Edit challenge"
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 hover:bg-gray-700 dark:hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                        aria-label="Delete challenge"
                      >
                        <Trash2 className={`w-4 h-4 ${isDeleting ? "text-gray-500" : "text-red-500"}`} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`${getDifficultyColor(challenge.difficulty)}`}>{challenge.difficulty}</Badge>
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        {formatDate(challenge.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(challenge.category) ? (
                        challenge.category.map((tag, index) => (
                          <Badge
                            key={`${tag}-${index}`}
                            className="bg-black text-md dark:bg-blue-100/50 text-white dark:text-blue-600 border-blue-500/30"
                          >
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <Badge className="bg-blue-900/80 dark:bg-blue-100/50 text-blue-400 dark:text-blue-600 border-blue-500/30">
                          {challenge.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="bg-gray-700 dark:bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-white dark:text-gray-900">
                        <AnimatedCounter value={challenge.solvedUsersCount || 0} /> / {stats.usersCount || 0} solved
                      </span>
                    </div>
                    <span className="text-sm font-medium text-blue-400 dark:text-blue-600">
                      {solvedPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-2 bg-secondary dark:bg-muted px-2 py-1 rounded-full text-secondary-foreground dark:text-muted-foreground">
                    <Code className="h-5 w-4 text-primary" />
                    {challenge.platform}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    )
  },
)
ProblemCard.displayName = "ProblemCard"

// Pagination Component
const Pagination = memo(
  ({
    currentPage,
    totalPages,
    onPageChange,
    hasNextPage,
    hasPrevPage,
  }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    hasNextPage: boolean
    hasPrevPage: boolean
  }) => (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className="p-2 rounded-md bg-gray-800 dark:bg-white border border-gray-700 dark:border-gray-200 hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4 text-white dark:text-gray-900" />
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum = i + 1
          if (totalPages > 5) {
            if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }
          }
          return pageNum
        }).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-3 py-1 rounded-md transition-colors ${
              currentPage === pageNum
                ? "bg-blue-600 dark:bg-blue-500 text-white"
                : "bg-gray-800 dark:bg-white border border-gray-700 dark:border-gray-200 text-gray-200 dark:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-100"
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="p-2 rounded-md bg-gray-800 dark:bg-white border border-gray-700 dark:border-gray-200 hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4 text-white dark:text-gray-900" />
      </button>

      <span className="ml-4 text-sm text-gray-400 dark:text-gray-500">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  ),
)
Pagination.displayName = "Pagination"

// Stat Card Component
const StatCard = memo(
  ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800 dark:bg-white p-6 rounded-lg shadow-md border border-gray-700 dark:border-gray-200 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 dark:text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-white dark:text-gray-900 mt-1">
            {typeof value === "number" ? (
              <AnimatedCounter value={value} />
            ) : (
              value
            )}
            {typeof value === "number" && title.includes("Rate") && "%"}
          </p>
        </div>
        <div className="p-3 bg-blue-900/30 dark:bg-blue-100 rounded-full">
          {icon}
        </div>
      </div>
    </motion.div>
  )
);
StatCard.displayName = "StatCard";

// Main AdminChallenges Component
const AdminChallenges: React.FC = () => {
  const {
    challenges: storeRawChallenges,
    users: storeUsers,
    challengePagination,
    fetchChallenges,
    fetchUsers,
    fetchStats: storeFetchStats,
    fetchPOTD,
    deleteChallenge,
    loading: storeLoading,
  } = useAdminStore()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [processedChallenges, setProcessedChallenges] = useState<Challenge[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [stats, setStats] = useState({ usersCount: 0, challengesCount: 0, solvedChallenges: 0 })
  const [todayChallenge, setTodayChallenge] = useState<Challenge | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    const loadStats = async () => {
      const statsData = await storeFetchStats()
      if (statsData) {
        const parseFormattedNumber = (str: string) => {
          if (typeof str === "number") return str
          if (str.includes("M+")) return Number.parseFloat(str.replace("M+", "")) * 1000000
          if (str.includes("k+")) return Number.parseFloat(str.replace("k+", "")) * 1000
          if (str.includes("+")) return Number.parseInt(str.replace("+", ""))
          return Number.parseInt(str) || 0
        }

        setStats({
          usersCount: parseFormattedNumber(statsData.usersCount),
          challengesCount: parseFormattedNumber(statsData.challengesCount),
          solvedChallenges: parseFormattedNumber(statsData.solvedChallenges),
        })
      }
    }

    loadStats()
  }, [storeFetchStats])

  // Fetch challenges and user data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchChallenges({
            page: currentPage,
            limit: 10,
            search: searchQuery,
            difficulty: filterDifficulty !== "all" ? filterDifficulty : "",
            sortBy,
          }),
          fetchUsers(),
        ])

        const potdData = await fetchPOTD()
        if (potdData && potdData.challenge) {
          const challenge = potdData.challenge
          const solvedUsersCount = challenge.solvedUsers?.length || 0

          const formattedChallenge: Challenge = {
            _id: challenge._id,
            title: challenge.title,
            createdAt: challenge.createdAt,
            category: Array.isArray(challenge.category)
              ? challenge.category
              : challenge.category
                ? [challenge.category]
                : [],
            difficulty: challenge.difficulty as "Easy" | "Medium" | "Hard",
            platform: challenge.platform || "Unknown",
            description: challenge.description || "",
            problemLink: challenge.problemLink || "#",
            solvedUsers: challenge.solvedUsers || [],
            solvedUsersCount,
            totalUsers: storeUsers.length,
            solvedPercentage: storeUsers.length > 0 ? Math.round((solvedUsersCount / storeUsers.length) * 100) : 0,
          }

          setTodayChallenge(formattedChallenge)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [fetchChallenges, fetchUsers, fetchPOTD, storeUsers.length, currentPage, searchQuery, filterDifficulty, sortBy])

  const totalUsersCount = useMemo(() => {
    return storeUsers.length
  }, [storeUsers])

  // Process challenges
  useEffect(() => {
    if (storeRawChallenges.length > 0) {
      const processedData = storeRawChallenges.map((challenge) => {
        const solvedUsersCount = challenge.solvedUsers?.length || 0
        const solvedPercentage = totalUsersCount > 0 ? Math.round((solvedUsersCount / totalUsersCount) * 100) : 0

        const categoryArray = Array.isArray(challenge.category)
          ? challenge.category
          : challenge.category
            ? [challenge.category]
            : []

        return {
          _id: challenge._id,
          title: challenge.title,
          createdAt: challenge.createdAt,
          category: categoryArray,
          difficulty: challenge.difficulty as "Easy" | "Medium" | "Hard",
          platform: challenge.platform || "Unknown",
          description: challenge.description || "",
          problemLink: challenge.problemLink || "#",
          solvedUsers: challenge.solvedUsers || [],
          solvedUsersCount,
          totalUsers: totalUsersCount,
          solvedPercentage,
        }
      })

      setProcessedChallenges(processedData)
    } else if (!storeLoading) {
      setIsLoading(false)
    }
  }, [storeRawChallenges, storeLoading, totalUsersCount])

  // Handle edit challenge
  const handleEditChallenge = (challenge: Challenge) => {
    navigate("/codingclubadmin/addchallenge", {
      state: { challenge, fromAdmin: true },
    })
    toast.success("Redirected to edit challenge!")
  }

  // Handle delete challenge
  const handleDeleteChallenge = async (id: string) => {
    const success = await deleteChallenge(id)
    if (success) {
      toast.success("Challenge deleted successfully!")
    } else {
      toast.error("Failed to delete challenge")
    }
  }

  const handleAddNewProblem = () => {
    navigate("/codingclubadmin/addchallenge")
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-white dark:text-gray-900 mb-8">Challenges Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Problems"
          value={stats.challengesCount}
          icon={<Calendar className="h-6 w-6 text-blue-500" />}
        />
        <StatCard
          title="Average Solve Rate"
          value={stats.solvedChallenges / stats.challengesCount}
          icon={<SlidersHorizontal className="h-6 w-6 text-blue-500" />}
        />
        <StatCard title="Top Performer" value="N/A" icon={<Zap className="h-6 w-6 text-blue-500" />} />
        <StatCard title="Needs Improvement" value="N/A" icon={<ChevronDown className="h-6 w-6 text-blue-500" />} />
      </div>

      {isLoading ? (
        <div className="mb-5 bg-gray-800 dark:bg-white shadow-lg overflow-hidden border border-gray-700 dark:border-gray-200 rounded-lg p-6">
          <SkeletonLoader />
        </div>
      ) : (
        todayChallenge && (
          <ProblemCard
            challenge={todayChallenge}
            isToday={true}
            stats={stats}
            onEdit={handleEditChallenge}
            onDelete={handleDeleteChallenge}
          />
        )
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search problems..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <div className="flex gap-2">
          <Dropdown
            trigger={
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                {filterDifficulty === "all"
                  ? "All Difficulties"
                  : filterDifficulty.charAt(0).toUpperCase() + filterDifficulty.slice(1)}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            }
            items={[
              {
                label: "All Difficulties",
                onClick: () => {
                  setFilterDifficulty("all")
                  setCurrentPage(1)
                },
              },
              {
                label: "Easy",
                onClick: () => {
                  setFilterDifficulty("Easy")
                  setCurrentPage(1)
                },
              },
              {
                label: "Medium",
                onClick: () => {
                  setFilterDifficulty("Medium")
                  setCurrentPage(1)
                },
              },
              {
                label: "Hard",
                onClick: () => {
                  setFilterDifficulty("Hard")
                  setCurrentPage(1)
                },
              },
            ]}
          />
          <Dropdown
            trigger={
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <SlidersHorizontal className="h-4 w-4" />
                {sortBy === "date"
                  ? "Date"
                  : sortBy === "title"
                    ? "Title"
                    : sortBy === "difficulty"
                      ? "Difficulty"
                      : "Completion"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            }
            items={[
              { label: "Date", onClick: () => setSortBy("createdAt") },
              { label: "Title", onClick: () => setSortBy("title") },
              { label: "Difficulty", onClick: () => setSortBy("difficulty") },
              { label: "Completion", onClick: () => setSortBy("solvedPercentage") },
            ]}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white dark:text-gray-900 mb-4 flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Previous Problems
        </h2>

        <AnimatePresence>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="mb-5 bg-gray-800 dark:bg-white shadow-lg overflow-hidden border border-gray-700 dark:border-gray-200 rounded-lg p-6"
                >
                  <SkeletonLoader />
                </div>
              ))}
            </div>
          ) : processedChallenges.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 text-gray-400 dark:text-gray-500"
            >
              No problems match your filters
            </motion.div>
          ) : (
            processedChallenges.map((challenge) => (
              <motion.div
                key={challenge._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  onClick={() => navigate(`/codingclubadmin/challenges/${challenge._id}`)}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <ProblemCard
                    challenge={challenge}
                    stats={stats}
                    onEdit={handleEditChallenge}
                    onDelete={handleDeleteChallenge}
                  />
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {challengePagination && challengePagination.totalPages > 1 && (
        <Pagination
          currentPage={challengePagination.currentPage}
          totalPages={challengePagination.totalPages}
          hasNextPage={challengePagination.hasNextPage}
          hasPrevPage={challengePagination.hasPrevPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Add New Problem Button */}
      <div className="fixed bottom-8 right-8">
        <Button className="rounded-full p-4 shadow-lg" onClick={handleAddNewProblem}>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add New Problem
          </div>
        </Button>
      </div>
    </div>
  )
}

export default AdminChallenges