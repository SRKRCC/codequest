import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Users, Filter, X, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAdminStore } from "@/context/AdminContext"
import { useDebounce } from "@/lib/useDebounce"

// Filter types
type FilterType = "collegeName" | "branch"
type SortField = "username" | "collegeName" | "branch" | "createdAt"

export default function UserDashboard() {
  const { users, fetchUsers, loading, error, pagination, filterOptions } = useAdminStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [activeFilters, setActiveFilters] = useState<Record<FilterType, string[]>>({
    collegeName: [],
    branch: [],
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const navigate = useNavigate()

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Fetch users whenever filters, search, sort, or page changes
  const fetchUsersWithParams = useCallback(async () => {
    try {
      await fetchUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        collegeName: activeFilters.collegeName,
        branch: activeFilters.branch,
        sortBy,
        sortDirection,
      })
    } catch (err) {
      console.error("Error fetching users:", err)
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm, activeFilters, sortBy, sortDirection, fetchUsers])

  // Initial fetch
  useEffect(() => {
    fetchUsersWithParams()
  }, [fetchUsersWithParams])

  // Reset to page 1 when filters change (not when page changes)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm, activeFilters, sortBy, sortDirection])

  const toggleFilter = (type: FilterType, value: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev }
      if (newFilters[type].includes(value)) {
        newFilters[type] = newFilters[type].filter((v) => v !== value)
      } else {
        newFilters[type] = [...newFilters[type], value]
      }
      return newFilters
    })
  }

  const clearFilters = () => {
    setActiveFilters({ collegeName: [], branch: [] })
    setSearchTerm("")
    setSortBy("createdAt")
    setSortDirection("desc")
  }

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
  }

  // Generate pagination buttons with ellipsis
  const getPaginationButtons = () => {
    if (!pagination || pagination.totalPages <= 1) return []
    
    const buttons = []
    const currentPage = pagination.currentPage
    const totalPages = pagination.totalPages
    
    // Always show first page
    buttons.push(1)
    
    // Add ellipsis if there's a gap
    if (currentPage > 3) {
      buttons.push('...')
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!buttons.includes(i)) {
        buttons.push(i)
      }
    }
    
    // Add ellipsis if there's a gap
    if (currentPage < totalPages - 2) {
      buttons.push('...')
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1 && !buttons.includes(totalPages)) {
      buttons.push(totalPages)
    }
    
    return buttons
  }

  // Function to get initials from name
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  }

  const filterVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      } as const,
    },
  }

  return (
    <div className="container ml-0 md:mx-3 px-16 py-16">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          User Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          Manage and monitor all registered users across the platform
        </p>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg"
        >
          <strong>Error:</strong> {error}
        </motion.div>
      )}

      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-slate-400 text-slate-500" size={18} />
          <Input
            type="text"
            placeholder="Search users by name, email, college, or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:border-slate-300 border-slate-600 dark:bg-white bg-slate-800 dark:text-slate-900 text-slate-100 focus:border-violet-500 dark:focus:border-violet-400 focus:ring-violet-500 dark:focus:ring-violet-400 transition-all duration-300 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-slate-500 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-3 w-full md:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`transition-all duration-300 ${
              showFilters 
                ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-300 dark:border-violet-600 shadow-md" 
                : "hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-400"
            }`}
          >
            <Filter size={16} className="mr-2" />
            Filters
            {(activeFilters.collegeName.length > 0 || activeFilters.branch.length > 0) && (
              <Badge className="ml-2 bg-violet-500 dark:bg-violet-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFilters.collegeName.length + activeFilters.branch.length}
              </Badge>
            )}
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            variants={filterVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mb-6 overflow-hidden"
          >
            <div className="dark:bg-white bg-slate-800 rounded-xl p-6 shadow-sm border dark:border-slate-200 border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold dark:text-slate-800 text-slate-200 flex items-center text-lg">
                  <Filter size={18} className="mr-2"/>
                  Filter & Sort Users
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="dark:text-slate-500 text-slate-400 dark:hover:text-slate-700 hover:text-slate-300 dark:hover:bg-slate-100 hover:bg-slate-700"
                >
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* College Filter */}
                <div>
                  <h4 className="text-sm font-medium dark:text-slate-700 text-slate-300 mb-3 flex items-center">
                    <Users size={14} className="mr-2" />
                    College ({filterOptions?.colleges?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {filterOptions?.colleges?.map((college) => (
                      <Badge
                        key={college}
                        variant={activeFilters.collegeName.includes(college) ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-300 text-xs ${
                          activeFilters.collegeName.includes(college)
                            ? "bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
                            : "dark:hover:border-indigo-500 hover:border-indigo-400 dark:hover:text-indigo-600 hover:text-indigo-400 dark:hover:bg-indigo-50 hover:bg-indigo-900/20 dark:border-slate-300 border-slate-600 dark:text-slate-700 text-slate-300"
                        }`}
                        onClick={() => toggleFilter("collegeName", college)}
                      >
                        {college}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Branch Filter */}
                <div>
                  <h4 className="text-sm font-medium dark:text-slate-700 text-slate-300 mb-3 flex items-center">
                    <Users size={14} className="mr-2" />
                    Branch ({filterOptions?.branches?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {filterOptions?.branches?.map((branch) => (
                      <Badge
                        key={branch}
                        variant={activeFilters.branch.includes(branch) ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-300 text-xs ${
                          activeFilters.branch.includes(branch)
                            ? "bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-600 dark:hover:bg-sky-700"
                            : "dark:hover:border-sky-500 hover:border-sky-400 dark:hover:text-sky-600 hover:text-sky-400 dark:hover:bg-sky-50 hover:bg-sky-900/20 dark:border-slate-300 border-slate-600 dark:text-slate-700 text-slate-300"
                        }`}
                        onClick={() => toggleFilter("branch", branch)}
                      >
                        {branch}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h4 className="text-sm font-medium dark:text-slate-700 text-slate-300 mb-3 flex items-center">
                    <ArrowUpDown size={14} className="mr-2" />
                    Sort By
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { field: "username", label: "Username" },
                      { field: "collegeName", label: "College" },
                      { field: "branch", label: "Branch" },
                      { field: "createdAt", label: "Join Date" }
                    ].map(({ field, label }) => (
                      <Badge
                        key={field}
                        variant={sortBy === field ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-300 text-xs ${
                          sortBy === field
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
                            : "dark:hover:border-emerald-500 hover:border-emerald-400 dark:hover:text-emerald-600 hover:text-emerald-400 dark:hover:bg-emerald-50 hover:bg-emerald-900/20 dark:border-slate-300 border-slate-600 dark:text-slate-700 text-slate-300"
                        }`}
                        onClick={() => handleSort(field as SortField)}
                      >
                        {label}
                        {sortBy === field && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold dark:text-slate-800 text-slate-200 flex items-center">
            <Users size={20} className="mr-2" />
            {pagination?.totalUsers || 0} Users Found
          </h2>
          {pagination && (
            <Badge variant="outline" className="text-xs dark:border-slate-300 border-slate-600 dark:text-slate-600 text-slate-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </Badge>
          )}
        </div>

        {(Object.values(activeFilters).some((filters) => filters.length > 0) || searchTerm) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters} 
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={16} className="mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Users Table Header */}
      <div className="dark:bg-slate-50 bg-slate-800 rounded-lg p-4 mb-2 shadow-sm border dark:border-slate-200 border-slate-700">
        <div className="grid grid-cols-4 gap-4 text-sm font-medium dark:text-slate-700 text-slate-300">
          <div className="flex items-center">User Info</div>
          <div className="hidden md:block">College</div>
          <div className="hidden md:block">Branch</div>
          <div className="hidden lg:block">Joined</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center mb-4">
            <div className="animate-spin h-8 w-8 border-4 border-white rounded-full border-t-transparent"></div>
          </div>
          <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">Loading Users</h3>
          <p className="text-slate-500 dark:text-slate-400">Fetching user data from the server...</p>
        </div>
      ) : users?.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="text-center py-16"
        >
          <div className="mx-auto w-24 h-24 rounded-full dark:bg-slate-100 bg-slate-800 flex items-center justify-center mb-6">
            <Users size={32} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-medium dark:text-slate-700 text-slate-300 mb-2">No Users Found</h3>
          <p className="dark:text-slate-500 text-slate-400 max-w-md mx-auto mb-6">
            No users match your current search criteria. Try adjusting your filters or search term.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
          {users.map((user) => (
            <motion.div key={user._id} variants={itemVariants}>
              <Card
                className="overflow-hidden hover:shadow-md transition-all duration-300 border border-slate-700 dark:border-slate-200 cursor-pointer group hover:border-violet-300 dark:hover:border-violet-600 dark:bg-white bg-slate-800"
                onClick={() => navigate(`/codingclubadmin/users/profile/${user.username}`)}
              >
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-medium">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold dark:text-slate-900 text-slate-100 truncate">
                          {user.name || user.username}
                        </p>
                        <p className="text-xs dark:text-slate-500 text-slate-400 truncate">@{user.username}</p>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <Badge
                        variant="outline"
                        className="dark:bg-indigo-50 bg-indigo-900/20 dark:text-indigo-700 text-indigo-400 dark:border-indigo-200 border-indigo-700 text-xs font-medium truncate max-w-full"
                        title={user.collegeName}
                      >
                        {user.collegeName || "N/A"}
                      </Badge>
                    </div>
                    <div className="hidden md:block">
                      <Badge
                        variant="outline"
                        className="dark:bg-sky-50 bg-sky-900/20 dark:text-sky-700 text-sky-400 dark:border-sky-200 border-sky-700 text-xs font-medium truncate max-w-full"
                        title={user.branch}
                      >
                        {user.branch || "N/A"}
                      </Badge>
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-xs dark:text-slate-500 text-slate-400">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Mobile view - show college and branch below */}
                  <div className="md:hidden mt-3 flex gap-2">
                    <Badge
                      variant="outline"
                      className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700 text-xs"
                    >
                      {user.collegeName || "N/A"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-700 text-xs"
                    >
                      {user.branch || "N/A"}
                    </Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Enhanced Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center items-center gap-2 mt-8 flex-wrap"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={!pagination.hasPrevPage || loading}
            className="hidden sm:flex"
          >
            First
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage || loading}
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </Button>

          {getPaginationButtons().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-slate-500 dark:text-slate-400">...</span>
              ) : (
                <Button
                  variant={pagination.currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page as number)}
                  disabled={loading}
                  className={pagination.currentPage === page ? "bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700" : ""}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage || loading}
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(pagination.totalPages)}
            disabled={!pagination.hasNextPage || loading}
            className="hidden sm:flex"
          >
            Last
          </Button>
        </motion.div>
      )}

      {/* Pagination Info */}
      {pagination && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400"
        >
          Showing {((pagination.currentPage - 1) * itemsPerPage) + 1} to{' '}
          {Math.min(pagination.currentPage * itemsPerPage, pagination.totalUsers)} of{' '}
          {pagination.totalUsers} users
        </motion.div>
      )}
    </div>
  )
}