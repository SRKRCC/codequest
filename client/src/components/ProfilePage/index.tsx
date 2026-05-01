import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { updatePlatformCacheTimestamp, isPlatformDataStale } from "./platformCache"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Calendar,
  ChevronUp,
  Code2,
  Flame,
  Github,
  Linkedin,
  MapPin,
  School,
  Settings,
  Sparkles,
  Trophy,
  Twitter,
  Loader2,
} from "lucide-react"
import toast from "react-hot-toast"
import { PlatformManager } from "./platform-manager"
import { fetchPlatformsData } from "@/platforms/get-platforms-data"

export interface ProfileUser {
  _id?: string
  leetCode?: { username?: string; solved?: number; rank?: number; rating?: number }
  // gfg?: { username?: string; solved?: number; rank?: number; rating?: number }
  codeforces?: { username?: string; solved?: number; rank?: string; rating?: number }
  // codechef?: { username?: string; stars?: string; rank?: number; rating?: number }
  profilePicture?: string
  name?: string
  username?: string
  rank?: number
  collegeName?: string
  branch?: string
  RegistrationNumber?: string
  otherLinks?: { platform: string; url: string }[]
  solveChallenges?: {
    easy: Array<{
      challenge: string
      timestamp: string
    }>
    medium: Array<{
      challenge: string
      timestamp: string
    }>
    hard: Array<{
      challenge: string
      timestamp: string
    }>
  }
  points?: number
  streak?: number
  potdSolved?: { timestamp: string }[]
}

export default function ProfilePage() {
  const { username: routeUsername } = useParams()
  const navigate = useNavigate()
  const { user, verificationString, logoutWhileDeletingUser } = useAuth()

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())


  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [usernameInput, setUsernameInput] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const generateHeatmapFromSolveChallenges = (user: ProfileUser | null) => {
    if (!user || !user.solveChallenges) return []

    const heatmapData: { timestamp: string }[] = []

    if (user.solveChallenges.easy) {
      user.solveChallenges.easy.forEach((challenge) => {
        if (challenge.timestamp) {
          heatmapData.push({ timestamp: challenge.timestamp })
        }
      })
    }

    if (user.solveChallenges.medium) {
      user.solveChallenges.medium.forEach((challenge) => {
        if (challenge.timestamp) {
          heatmapData.push({ timestamp: challenge.timestamp })
        }
      })
    }

    if (user.solveChallenges.hard) {
      user.solveChallenges.hard.forEach((challenge) => {
        if (challenge.timestamp) {
          heatmapData.push({ timestamp: challenge.timestamp })
        }
      })
    }

    return heatmapData
  }

  useEffect(() => {
    const updatePlatforms = async () => {
      if (!profileUser || !profileUser.username) return
      if (!isPlatformDataStale(profileUser.username, 60)) { return }

      try {
        console.log("Updating platforms...")
        const updatedUser = await fetchPlatformsData(profileUser)
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/${profileUser.username}/update-platforms`, updatedUser);
        
        if (response.status === 200) {
          setProfileUser(updatedUser)
          toast.success("Data updated successfully")
          updatePlatformCacheTimestamp(profileUser.username)
        } else if (response.status === 429) {
          const nextUpdateTime = new Date(response.data.nextUpdateTime)
          toast.success(`Please wait until ${nextUpdateTime.toLocaleTimeString()} to update platform data again`)
          updatePlatformCacheTimestamp(profileUser.username)
        }
      } catch (error) {
        console.error("Error updating platforms:", error)
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          const nextUpdateTime = error.response.data?.nextUpdateTime
          if (nextUpdateTime) {
            const nextTime = new Date(nextUpdateTime)
            toast.success(`Please wait until ${nextTime.toLocaleTimeString()} to update platform data again`)
          } else {
            toast.success("Platform data was updated recently. Please wait before updating again.")
          }
        } else {
          toast.error("Failed to update platform data")
        }
        updatePlatformCacheTimestamp(profileUser.username)
      }
    }
    updatePlatforms()
  }, [profileUser])

  useEffect(() => {
    const fetchProfileUser = async () => {
      setLoading(true)
      setError(null)
      const usernameToFetch = routeUsername || user?.username || "default"
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/${usernameToFetch}`)
        setProfileUser(response.data.user)
      } catch (err) {
        console.error("Error fetching user:", err)
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "User not found")
        } else {
          toast.error("An unexpected error occurred")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProfileUser()
  }, [routeUsername, user?.username])

  // Handle platform verification
  const handleVerifyPlatform = async (platform: string, username: string): Promise<boolean> => {
    if (!verificationString) {
      console.warn("Verification string is undefined or empty.")
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/verifyacc`,
        {
          platform,
          username,
          verificationString,
          userId: user?._id,
        },
        { withCredentials: true },
      )

      if (response.status === 200) {
        toast.success(response.data.message)
        setProfileUser((prev) => {
          if (!prev) return prev

          return {
            ...prev,
            [platform]: {
              username,
              solved: response.data.platformData?.solved || 0,
              rank: response.data.platformData?.rank || 0,
              rating: response.data.platformData?.rating || 0,
            },
          }
        })
      } else {
        const errorMessage = (response.data as { error?: string })?.error
        toast.error(errorMessage || "An unexpected error occurred.")
      }

      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error verifying platform:", error.response?.data?.message || error.message)
      } else {
        console.error("Error verifying platform:", error)
      }
      toast.error("Verification failed, try again")
      return false
    }
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!profileUser?._id) return

    setIsDeleting(true)
    setDeleteError("")

    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/auth/users/${profileUser._id}`, { withCredentials: true })

      if (response.status === 204) {
        toast.success("Account deleted successfully")
        logoutWhileDeletingUser();
        navigate("/")
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Failed to delete account"
        setDeleteError(errorMessage)
        toast.error(errorMessage)
      } else {
        setDeleteError("An unexpected error occurred")
        toast.error("An unexpected error occurred")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  // Reset modal states when closing
  const handleCloseModal = () => {
    setShowDeleteModal(false)
    setShowConfirmation(false)
    setUsernameInput("")
    setDeleteError("")
    setIsDeleting(false)
  }

  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-2xl font-bold text-red-500 mb-2">Error</div>
        <div className="text-muted-foreground text-center">{error}</div>
        <Button className="mt-4" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-2xl font-bold mb-2">No User Data</div>
        <div className="text-muted-foreground text-center">No user data available</div>
        <Button className="mt-4" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </div>
    )
  }

  const problemsSolved = {
    total:
      (profileUser.solveChallenges?.easy?.length || 0) +
      (profileUser.solveChallenges?.medium?.length || 0) +
      (profileUser.solveChallenges?.hard?.length || 0),
    easy: profileUser.solveChallenges?.easy?.length || 0,
    medium: profileUser.solveChallenges?.medium?.length || 0,
    hard: profileUser.solveChallenges?.hard?.length || 0,
  }

  const heatmap = generateHeatmapFromSolveChallenges(profileUser)

  interface GetDaysInMonthParams {
    month: number
    year: number
  }

  const getDaysInMonth = (month: GetDaysInMonthParams["month"], year: GetDaysInMonthParams["year"]): number =>
    new Date(year, month + 1, 0).getDate()

  interface Contribution {
    date: string
    count: number
  }

  const yearOptions = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2]

  interface StreakParams {
    monthIndex: number
    dayIndex: number
    monthContribs: Contribution[]
  }

  const isPartOfStreak = ({ monthIndex, dayIndex, monthContribs }: StreakParams): boolean => {
    const currentDate = new Date(selectedYear, monthIndex, dayIndex + 1)
    const currentContrib = monthContribs.find((c) => c.date === currentDate.toISOString().split("T")[0])
    const currentCount = currentContrib ? currentContrib.count : 0
    if (currentCount === 0) return false

    // Check previous day
    const prevDate = new Date(currentDate)
    prevDate.setDate(prevDate.getDate() - 1)
    const prevDateString = prevDate.toISOString().split("T")[0]
    const prevContrib = heatmap.find((item) => {
      if (item.timestamp) {
        const itemDate = new Date(item.timestamp).toISOString().split("T")[0]
        return itemDate === prevDateString
      }
      return false
    })

    // Check next day
    const nextDate = new Date(currentDate)
    nextDate.setDate(nextDate.getDate() + 1)
    const nextDateString = nextDate.toISOString().split("T")[0]
    const nextContrib = heatmap.find((item) => {
      if (item.timestamp) {
        const itemDate = new Date(item.timestamp).toISOString().split("T")[0]
        return itemDate === nextDateString
      }
      return false
    })

    return (prevContrib ? 1 : 0) > 0 || (nextContrib ? 1 : 0) > 0
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  const isOwnProfile = user?._id === profileUser._id

  const findSocialLink = (platform: string) => {
    if (!profileUser.otherLinks) return null
    const link = profileUser.otherLinks.find((link) => link.platform.toLowerCase() === platform.toLowerCase())
    return link ? link.url : null
  }

  const twitterLink = findSocialLink("twitter")
  const linkedinLink = findSocialLink("linkedin")
  const githubLink = findSocialLink("github")

  interface HeatmapItem {
    timestamp?: string
    _id?: string
  }

  function createDateContributionsMap(
    heatmap: HeatmapItem[] | undefined,
    year: number,
    monthIndex: number,
  ): Record<string, number> {
    if (!heatmap || !heatmap.length) {
      console.log("No heatmap data available")
      return {}
    }

    const dateContributionsMap: Record<string, number> = {}
    const monthStr = String(monthIndex + 1).padStart(2, "0")

    heatmap.forEach((item: HeatmapItem) => {
      try {
        if (!item.timestamp) {
          return
        }

        if (typeof item.timestamp === "string" && item.timestamp.includes(" ")) {
          const [datePart] = item.timestamp.split(" ")
          const [dateYear, dateMonth, dateDay] = datePart.split("-")
          const formattedMonth = dateMonth.padStart(2, "0")
          const dateString = `${dateYear}-${formattedMonth}-${dateDay.padStart(2, "0")}`

          if (Number.parseInt(dateYear) === year && formattedMonth === monthStr) {
            dateContributionsMap[dateString] = (dateContributionsMap[dateString] || 0) + 1
          }
        } else if (typeof item.timestamp === "string" && item.timestamp.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
          const [dateYear, dateMonth, dateDay] = item.timestamp.split("-")
          const formattedMonth = dateMonth.padStart(2, "0")
          const dateString = `${dateYear}-${formattedMonth}-${dateDay.padStart(2, "0")}`

          if (Number.parseInt(dateYear) === year && formattedMonth === monthStr) {
            dateContributionsMap[dateString] = (dateContributionsMap[dateString] || 0) + 1
          }
        } else {
          let contributionDate: Date

          if (!isNaN(Number.parseInt(item.timestamp))) {
            contributionDate = new Date(Number.parseInt(item.timestamp) * 1000)
          } else {
            contributionDate = new Date(item.timestamp)
          }

          if (isNaN(contributionDate.getTime())) {
            console.error("Invalid timestamp format:", item.timestamp)
            return
          }

          const dateStr = contributionDate.toISOString().split("T")[0]
          const [dateYear, dateMonth] = dateStr.split("-")

          if (Number.parseInt(dateYear) === year && dateMonth === monthStr) {
            dateContributionsMap[dateStr] = (dateContributionsMap[dateStr] || 0) + 1
          }
        }
      } catch (err) {
        console.error("Error processing timestamp:", item.timestamp, err)
      }
    })
    return dateContributionsMap
  }

 return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          className="flex flex-col md:flex-row gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Sidebar - Profile Details */}
          <motion.div className="md:w-80 lg:w-1/3 xl:w-1/4 flex-shrink-0" variants={cardVariants}>
            <Card className="overflow-hidden shadow-lg border-0 relative">
              {isOwnProfile && (
                <div className="absolute top-6 right-6 z-10">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-800 backdrop-blur-sm hover:bg-white/20 transition-colors"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <Settings className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              <div className="h-24 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
              <div className="px-6 pb-6 -mt-12">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-xl mx-auto ring-2 ring-purple-200">
                    <AvatarImage
                      src={profileUser.profilePicture || "/placeholder.svg?height=128&width=128"}
                      alt={profileUser.name || "User"}
                    />
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500">
                      {profileUser.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  {profileUser.rank && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md">
                        <ChevronUp className="h-3 w-3 mr-1" />
                        #{profileUser.rank}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent mb-1">
                    {profileUser.name}
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium">@{profileUser.username}</p>

                  <div className="mt-4 space-y-3">
                    {profileUser.collegeName && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground rounded-lg py-2 px-3">
                        <School className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{profileUser.collegeName}</span>
                      </div>
                    )}
                    {profileUser.branch && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground rounded-lg py-2 px-3">
                        <Code2 className="h-4 w-4 text-cyan-500" />
                        <span className="font-medium">{profileUser.branch}</span>
                      </div>
                    )}
                    {profileUser.RegistrationNumber && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground rounded-lg py-2 px-3">
                        <MapPin className="h-4 w-4 text-pink-500" />
                        <span className="font-medium">{profileUser.RegistrationNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-center gap-3">
                    {profileUser.otherLinks?.find((link) => link.platform === "Twitter")?.url && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="rounded-full hover:bg-sky-50 hover:border-sky-200 transition-colors" asChild>
                            {twitterLink && (
                              <Link to={twitterLink} target="_blank" rel="noopener noreferrer">
                                <Twitter className="h-4 w-4 text-sky-500" />
                              </Link>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Twitter</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {profileUser.otherLinks?.find((link) => link.platform === "LinkedIn")?.url && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="rounded-full hover:bg-blue-50 hover:border-blue-200 transition-colors" asChild>
                            {linkedinLink && (
                              <Link to={linkedinLink} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-4 w-4 text-blue-600" />
                              </Link>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>LinkedIn</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {profileUser.otherLinks?.find((link) => link.platform === "GitHub")?.url && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="rounded-full hover:bg-gray-50 hover:border-gray-200 transition-colors" asChild>
                            {githubLink && (
                              <Link to={githubLink} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4" />
                              </Link>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>GitHub</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {isOwnProfile && (
                    <div className="mt-6">
                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={() => navigate("/profile/edit-profile")}
                      >
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Coding Platforms */}
            <motion.div variants={cardVariants} className="mt-2">
              {isOwnProfile ? (
                <PlatformManager
                  userPlatforms={{
                    leetCode: profileUser.leetCode,
                    codeforces: profileUser.codeforces,
                  }}
                  onVerifyPlatform={handleVerifyPlatform}
                />
              ) : (
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Github className="mr-2 h-5 w-5 text-gray-500" /> Coding Platforms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      {
                        name: "LeetCode",
                        handle: profileUser.leetCode?.username || "-",
                        solved: profileUser.leetCode?.solved,
                        rating: profileUser.leetCode?.rating,
                        rank: profileUser.leetCode?.rank,
                        color: "#FFA116",
                        type: "leetcode",
                      },
                      {
                        name: "CodeForces",
                        handle: profileUser.codeforces?.username || "-",
                        solved: profileUser.codeforces?.solved,
                        rating: profileUser.codeforces?.rating,
                        rank: profileUser.codeforces?.rank,
                        color: "#318CE7",
                        type: "codeforces",
                      },
                    ].map((platform) => (
                      <motion.div
                        key={platform.name}
                        whileHover={{ scale: 1.02 }}
                        className="border-l-4 rounded-lg shadow-sm p-2 hover:shadow-md transition-shadow duration-200"
                        style={{ borderLeftColor: platform.color }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{platform.name}</div>
                            <div className="text-xs text-muted-foreground">@{platform.handle}</div>
                          </div>
                          <div className="flex flex-col items-end space-y-1 text-right">
                            {platform.rank !== undefined && (
                              <div className="text-xs">
                                <span className="text-muted-foreground">Rank:</span>{" "}
                                {platform.handle !== "-" ? (
                                  <span className="font-semibold">{platform.rank}</span>
                                ) : (
                                  <span className="font-semibold">--</span>
                                )}
                              </div>
                            )}
                            {platform.rating !== undefined && (
                              <div className="text-xs">
                                <span className="text-muted-foreground">Rating:</span>{" "}
                                {platform.handle !== "-" ? (
                                  <span className="font-semibold" style={{ color: platform.color }}>
                                    {platform.rating}
                                  </span>
                                ) : (
                                  <span className="font-semibold" style={{ color: platform.color }}>
                                    --
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </motion.div>

          {/* Main Content - Stats Cards */}
          <motion.div className="flex-1 min-w-0" variants={cardVariants}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div variants={cardVariants} whileHover={{ y: -5 }}>
                <Card className="shadow-lg border-0 overflow-hidden h-full">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4 flex-shrink-0">
                        <Code2 className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">Problems Solved</p>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                          {problemsSolved.total}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants} whileHover={{ y: -5 }}>
                <Card className="shadow-lg border-0 overflow-hidden h-full">
                  <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="bg-amber-100 p-3 rounded-lg mr-4 flex-shrink-0">
                        <Trophy className="h-6 w-6 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                          {profileUser.points || 0}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants} whileHover={{ y: -5 }} className="sm:col-span-2 lg:col-span-1">
                <Card className="shadow-lg border-0 overflow-hidden h-full">
                  <div className="h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-3 rounded-lg mr-4 flex-shrink-0">
                        <Flame className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                          {profileUser.streak || 0}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Problem Difficulty Breakdown */}
            <motion.div variants={cardVariants} className="mt-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-amber-500" /> Problem Difficulty Breakdown
                  </CardTitle>
                  <CardDescription>Track your progress across difficulty levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <motion.div
                      variants={cardVariants}
                      whileHover={{ scale: 1.03 }}
                      className="text-center p-4 md:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm"
                    >
                      <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="3"
                            strokeDasharray={`${(problemsSolved.easy / 300) * 100}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-2xl md:text-3xl font-bold text-green-600">{problemsSolved.easy}</div>
                        </div>
                      </div>
                      <div className="text-xs md:text-sm font-medium text-green-800 mt-2 md:mt-3">Easy</div>
                    </motion.div>

                    <motion.div
                      variants={cardVariants}
                      whileHover={{ scale: 1.03 }}
                      className="text-center p-4 md:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm"
                    >
                      <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth="3"
                            strokeDasharray={`${(problemsSolved.medium / 300) * 100}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-2xl md:text-3xl font-bold text-yellow-600">{problemsSolved.medium}</div>
                        </div>
                      </div>
                      <div className="text-xs md:text-sm font-medium text-yellow-800 mt-2 md:mt-3">Medium</div>
                    </motion.div>

                    <motion.div
                      variants={cardVariants}
                      whileHover={{ scale: 1.03 }}
                      className="text-center p-4 md:p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm"
                    >
                      <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="3"
                            strokeDasharray={`${(problemsSolved.hard / 100) * 100}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-2xl md:text-3xl font-bold text-red-600">{problemsSolved.hard}</div>
                        </div>
                      </div>
                      <div className="text-xs md:text-sm font-medium text-red-800 mt-2 md:mt-3">Hard</div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contributions Map */}
            <motion.div variants={cardVariants} className="mt-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-green-500" /> Contributions
                    </CardTitle>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
                      className="border rounded-md p-2 text-sm bg-background"
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <CardDescription>Your coding activity for {selectedYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto pb-4 -mx-2 px-2">
                    <div className="min-w-[700px] md:min-w-[850px]">
                      <div className="flex gap-2 md:gap-3 lg:gap-4">
                        {Array.from({ length: 12 }).map((_, monthIndex) => {
                          const daysInMonth = getDaysInMonth(monthIndex, selectedYear)
                          const firstDayOfMonth = new Date(selectedYear, monthIndex, 1).getDay()
                          const numWeeks = Math.ceil((daysInMonth + firstDayOfMonth) / 7)
                          const monthNames = [
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                          ]

                          const dateContributionsMap = createDateContributionsMap(heatmap, selectedYear, monthIndex)
                          return (
                            <div key={monthIndex} className="flex-none min-w-[50px] md:min-w-[65px]">
                              <div className="text-[10px] md:text-xs text-muted-foreground text-center mb-1 md:mb-2 font-medium">
                                {monthNames[monthIndex].slice(0, 3)}
                              </div>
                              <div
                                className="grid gap-0.5 md:gap-1"
                                style={{
                                  gridTemplateRows: `repeat(7, 1fr)`,
                                  gridTemplateColumns: `repeat(${numWeeks}, 1fr)`,
                                }}
                              >
                                {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                                  const date = new Date(selectedYear, monthIndex, dayIndex + 1)
                                  const dayOfWeek = date.getDay()

                                  const day = String(date.getDate()).padStart(2, "0")
                                  const month = String(date.getMonth() + 1).padStart(2, "0")
                                  const dateString = `${selectedYear}-${month}-${day}`

                                  const contributionCount = dateContributionsMap[dateString] || 0

                                  const getIntensityColor = (count: number) => {
                                    if (count === 0) return "bg-gray-300"
                                    return "bg-green-500"
                                  }

                                  const isSolved = contributionCount > 0
                                  const today = new Date()
                                  const isToday =
                                    today.getDate() === date.getDate() &&
                                    today.getMonth() === date.getMonth() &&
                                    today.getFullYear() === date.getFullYear()

                                  const inStreak = isPartOfStreak({
                                    monthIndex,
                                    dayIndex,
                                    monthContribs: Object.keys(dateContributionsMap)
                                      .filter((date) => date.startsWith(`${selectedYear}-${month}`))
                                      .map((date) => ({ date, count: dateContributionsMap[date] })),
                                  })

                                  return (
                                    <motion.div
                                      key={dayIndex}
                                      className={`h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 rounded-sm ${getIntensityColor(contributionCount)} ${isToday ? "ring-1 md:ring-2 ring-black dark:ring-white" : ""
                                        } ${inStreak && isSolved ? "shadow-[0_0_3px_1px_rgba(34,197,94,0.5)] md:shadow-[0_0_5px_2px_rgba(34,197,94,0.5)]" : ""}`}
                                      style={{
                                        gridRow: dayOfWeek + 1,
                                        gridColumn: Math.floor((dayIndex + firstDayOfMonth) / 7) + 1,
                                      }}
                                      title={`${date.toLocaleDateString()}: ${contributionCount > 0
                                          ? `${contributionCount} contribution${contributionCount > 1 ? "s" : ""}`
                                          : "No contributions"
                                        }`}
                                      whileHover={{ scale: 1.3, zIndex: 10 }}
                                      transition={{ duration: 0.2 }}
                                    />
                                  )
                                })}
                              </div>
                              <div className="text-[10px] md:text-xs text-muted-foreground text-center mt-1">
                                {Object.values(dateContributionsMap).reduce((sum, count) => sum + count, 0)}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground mt-3 md:mt-4">
                      <span>Less</span>
                      <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-sm bg-gray-300"></div>
                      <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-sm bg-green-700"></div>
                      <span>More</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Account Deletion Modal */}
        <Dialog open={showDeleteModal} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-red-600">
                {showConfirmation ? "Confirm Account Deletion" : "Delete Account"}
              </DialogTitle>
              <DialogDescription>
                {showConfirmation
                  ? "Please type your username to confirm account deletion."
                  : "Do you want to delete your account? This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>

            {!showConfirmation ? (
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => setShowConfirmation(true)}>
                  Delete Account
                </Button>
              </DialogFooter>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username-confirm">
                    Type <span className="font-mono font-semibold">{profileUser.username}</span> to confirm:
                  </Label>
                  <Input
                    id="username-confirm"
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value)
                      setDeleteError("")
                    }}
                    placeholder="Enter your username"
                    className={deleteError ? "border-red-500" : ""}
                  />
                  {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={usernameInput !== profileUser.username || isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
