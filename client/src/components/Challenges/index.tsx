/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

import ChallengePopup from "./ChallengePopup";
import SEO from "../SEO/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import ProblemStatus from "@/lib/solutionStatus";
import { Award, Calendar, CheckCircle, ChevronDown, ChevronUp, Clock, Code, Filter, Flame, Lightbulb, RefreshCw, Search, Tag, } from "lucide-react";
import toast from "react-hot-toast";

interface Challenge {
  id: number;
  date: string;
  title: string;
  categories: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  platform: "LeetCode" | "GFG" | "CodeChef" | "Codeforces";
  status: "Solved" | "Unsolved";
  description: string;
  problemUrl?: string;
  _id: string;
}

interface FilterOptions {
  categories: string[];
  difficulties: string[];
  platforms: string[];
}

type FilterTab = "all" | "solved" | "unsolved";

const Challenges: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [countdown, setCountdown] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const [problemsList, setProblemsList] = useState<Challenge[]>([]);
  const [dailyProblem, setDailyProblem] = useState<Challenge | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDailyLoading, setIsDailyLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    difficulties: [],
    platforms: []
  });
  const itemsPerPage = 5;
  const { user, isAuthenticated } = useAuth();

  // Debounced search function
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/challenges/filter-options`);
      if (res.data) {
        setFilterOptions(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
    }
  }, []);

  // Fetch daily challenge separately
  const fetchDailyChallenge = useCallback(async () => {
    try {
      setIsDailyLoading(true);
      const params = user ? { userId: user._id } : {};
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/challenges/daily`, { params });
      
      if (res.data) {
        const challenge = res.data;
        const formattedChallenge: Challenge = {
          id: challenge._id,
          date: new Date(challenge.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          title: challenge.title,
          categories: challenge.category,
          difficulty: challenge.difficulty,
          platform: challenge.platform,
          status: challenge.isSolved ? "Solved" : "Unsolved",
          description: challenge.description,
          problemUrl: challenge.problemLink,
          _id: challenge._id
        };

        setDailyProblem(formattedChallenge);
        setIsSolved(challenge.isSolved || false);
      } else {
        // No daily challenge data
        setDailyProblem(null);
        setIsSolved(false);
      }
    } catch (error) {
      console.error("Failed to fetch daily challenge:", error);
      // Backend returns 404 when no challenge is posted for today
      setDailyProblem(null);
      setIsSolved(false);
    } finally {
      setIsDailyLoading(false);
    }
  }, [user]);

  // Fetch challenges with filters and pagination
  const fetchChallenges = useCallback(async (page = 1, resetList = true) => {
    try {
      if (resetList) {
        setIsLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      // Add filters to params
      if (selectedDifficulties.length > 0) {
        params.append('difficulty', selectedDifficulties.join(','));
      }
      
      if (selectedCategories.length > 0) {
        params.append('category', selectedCategories.join(','));
      }

      if (debouncedSearchTerm.trim()) {
        params.append('search', debouncedSearchTerm.trim());
      }

      // Add userId if user is logged in (for filtering their solved/unsolved challenges)
      if (user) {
        params.append('userId', user._id);
      }

      // Add status filter if user is logged in and tab is not 'all'
      if (user && activeTab !== 'all') {
        params.append('status', activeTab);
      }

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/challenges?${params.toString()}`);
      
      if (res.data && Array.isArray(res.data.challenges)) {
        const formattedChallenges = res.data.challenges.map((challenge: any) => {
          return {
            id: challenge._id,
            date: new Date(challenge.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            title: challenge.title,
            categories: challenge.category,
            difficulty: challenge.difficulty,
            platform: challenge.platform,
            status: activeTab === 'solved' ? "Solved" : activeTab === 'unsolved' ? "Unsolved" : "Unsolved", // Set status based on active tab
            description: challenge.description,
            problemUrl: challenge.problemLink,
            _id: challenge._id
          };
        });

        if (resetList) {
          setProblemsList(formattedChallenges);
        } else {
          setProblemsList(prev => [...prev, ...formattedChallenges]);
        }

        setTotalPages(res.data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDifficulties, selectedCategories, debouncedSearchTerm, user, itemsPerPage, activeTab]);

  // No need for client-side filtering since backend handles status filtering
  const filteredProblems = problemsList;

  // Initial data fetch
  useEffect(() => {
    fetchFilterOptions();
    fetchDailyChallenge();
  }, [fetchFilterOptions, fetchDailyChallenge]);

  useEffect(() => {
    if (filterOptions.categories.length > 0) { // Only fetch when filter options are loaded
      fetchChallenges(1, true);
    }
  }, [fetchChallenges, filterOptions]);

  useEffect(() => {
    if (!user && activeTab !== 'all') {
      setActiveTab('all');
    }
  }, [user, activeTab]);

  // Show toast when user is not logged in
  useEffect(() => {
    if (!user) {
      toast.error("Sign in to view status and solutions", {
        duration: 2000,
        position: 'bottom-right',
      });
    }
  }, [user]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (filterOptions.categories.length > 0) {
      setCurrentPage(1);
      fetchChallenges(1, true);
    }
  }, [selectedDifficulties, selectedCategories, debouncedSearchTerm, activeTab]);

  // Update countdown timer every second
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const timeDiff = midnight.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      setCountdown({
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toggle difficulty filter
  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  // Toggle category filter
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Removed checkIfProblemSolved function - now using backend API for solve status

  const checkPotdSolved = async () => {
    setIsRefreshing(true);
    if(!isAuthenticated) {
      toast.error("Please login to check status");
      setIsRefreshing(false)
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/challenges/check-potd-status`, {
        dailyChallengeId: dailyProblem?._id
      }, {
        withCredentials: true
      });
      const { message, isSolved } = response.data;
      if (isSolved) {
        window.location.reload();
        toast.success(message || "Problem of the Day marked as solved!");
      } else {
        toast.error(message || "Haven't solved the Problem of the Day yet.");
      }
    } catch (error: any) {
      console.error("Error updating POTD status:", error);
      toast.error("Challenge not solved today");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      fetchChallenges(newPage, true);
    }
  };

  // Styling for difficulty levels
  const getDifficultyStyle = (difficulty: string) => {
    return (
      {
        Easy: "text-emerald-400 bg-emerald-900/50 dark:text-emerald-600 dark:bg-emerald-100",
        Medium: "text-amber-400 bg-amber-900/50 dark:text-amber-600 dark:bg-amber-100",
        Hard: "text-rose-400 bg-rose-900/50 dark:text-rose-600 dark:bg-rose-100",
      }[difficulty] || ""
    );
  };

  // Icons for difficulty levels
  const getDifficultyIcon = (difficulty: string) => {
    return (
      {
        Easy: <Award className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />,
        Medium: <Flame className="h-4 w-4 text-amber-400 dark:text-amber-600" />,
        Hard: <Lightbulb className="h-4 w-4 text-rose-400 dark:text-rose-600" />,
      }[difficulty] || null
    );
  };

  // Open challenge link in a new tab
  const openProblemLink = (url?: string) => {
    if(!isAuthenticated) {
      toast.error("Please login to open problem");
      return;
    } else {
      if(url) {
        window.open(url, "_blank")
      }
    }
  };

  return (
    <>
      <SEO 
        title="Daily Coding Challenges | CodeQuest"
        description="Solve daily coding challenges from LeetCode, GeeksforGeeks, CodeChef, and Codeforces. Practice algorithms, data structures, and competitive programming problems."
        keywords="daily coding challenges, leetcode problems, competitive programming, algorithms practice, data structures, coding contests"
      />
      <div className="w-full max-w-[1040px] mx-auto px-4 py-5 space-y-8 min-h-screen">
      {/* Daily Challenge Section */}
      <Card className="rounded-xl overflow-hidden shadow-lg border-1">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <div className="mr-3 bg-primary/20 dark:bg-primary/30 p-2 rounded-full">
                <Flame className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 dark:text-gray-800 tracking-tight">
                Daily Challenge
              </h2>
            </div>
            {user ? (
              <div className="flex items-center gap-4 mx-auto sm:mx-0">
                <div className="flex items-center gap-2 bg-secondary/50 dark:bg-muted/50 px-3 py-1 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-500 animate-pulse" />
                  <span className="font-semibold">{user?.streak} day streak</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 dark:bg-muted/50 px-3 py-1 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">
                    {user?.solveChallenges?.easy?.length + user?.solveChallenges?.medium?.length + user?.solveChallenges?.hard?.length} solved
                  </span>
                </div>
              </div>
            ) : null}
            <div className="flex items-center gap-1 text-base sm:text-lg font-mono bg-secondary/60 dark:bg-muted/60 px-3 py-2 rounded-lg">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              <span className="bg-card text-gray-200 dark:text-foreground px-3 py-1 rounded shadow-sm">
                {countdown.hours}
              </span>
              <span className="text-gray-400 dark:text-muted-foreground px-1">:</span>
              <span className="bg-card text-gray-200 dark:text-foreground px-3 py-1 rounded shadow-sm">
                {countdown.minutes}
              </span>
              <span className="text-gray-400 dark:text-muted-foreground px-1">:</span>
              <span className="bg-card text-gray-200 dark:text-foreground px-3 py-1 rounded shadow-sm">
                {countdown.seconds}
              </span>
            </div>
          </div>
          
          {isDailyLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : dailyProblem ? (
            <div
              className="mt-6 bg-gray-800 dark:bg-muted rounded-xl p-4 sm:p-6 cursor-pointer"
              onClick={() => openProblemLink(dailyProblem?.problemUrl)}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center text-sm text-gray-400 dark:text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-600" />
                    {dailyProblem.date}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-200 dark:text-gray-800 line-clamp-1">
                    {dailyProblem.title}
                  </h3>
                  {/* <p className="text-gray-400 dark:text-gray-600 text-sm line-clamp-2">
                    {dailyProblem.description}
                  </p> */}
                  <div className="flex flex-wrap gap-2">
                    {dailyProblem.categories.map((cat: any) => (
                      <Badge
                        key={String(cat)}
                        variant="secondary"
                        className="text-xs py-1 px-2 bg-secondary dark:bg-white text-gray-300 dark:text-gray-700 rounded-full"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4 justify-center">
                  {isSolved ? (
                    <Button className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 px-6 py-2 rounded-full">
                      <CheckCircle className="h-3 w-3 mr-1" /> Solved
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="bg-primary hover:bg-primary/90 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 px-6 py-2 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProblemLink(dailyProblem?.problemUrl);
                        }}
                      >
                        Solve Now
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          checkPotdSolved();
                        }}
                        className="bg-primary/20 hover:bg-primary/30 text-primary border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-full flex items-center gap-2"
                        disabled={isRefreshing}
                      >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Check Status
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700 dark:border-gray-300 flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-2 bg-secondary dark:bg-white px-2 py-1 rounded-full text-gray-300 dark:text-gray-700">
                  <Code className="h-4 w-4 text-primary" />
                  {dailyProblem.platform}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-6 bg-gray-800 dark:bg-muted rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center text-center space-y-4 h-40">
              <div className="bg-amber-500/20 dark:bg-amber-500/30 p-3 rounded-full">
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-200 dark:text-gray-800">
                  No Problem Posted Today
                </h3>
                <p className="text-gray-400 dark:text-gray-600 text-sm">
                  Please wait until a new daily challenge is posted. Check back soon!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters and Challenges List */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4 w-full">
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              className="w-full flex justify-between items-center text-sm py-2 px-4 border-border text-foreground"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <span className="flex items-center">
                <Filter className="h-4 w-4 mr-2" /> Filters
              </span>
              {isFilterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          <Card className={`shadow-lg border-0 bg-card ${isFilterOpen ? "block" : "hidden lg:block"}`}>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center text-foreground">
                  <Flame className="h-5 w-5 mr-2 text-amber-400 dark:text-amber-900" /> Difficulty
                </h3>
                <div className="flex flex-col gap-3">
                  {filterOptions.difficulties.map((level) => (
                    <div key={level} className="flex items-center gap-3">
                      <button
                        onClick={() => toggleDifficulty(level)}
                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedDifficulties.includes(level) ? "bg-primary border-primary" : "border-border"
                          }`}
                      >
                        {selectedDifficulties.includes(level) && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3 w-3 text-primary-foreground"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                      <label
                        htmlFor={level}
                        className="text-sm font-medium flex items-center gap-2 cursor-pointer text-foreground"
                        onClick={() => toggleDifficulty(level)}
                      >
                        {getDifficultyIcon(level)}
                        <span>{level}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center text-foreground">
                  <Tag className="h-5 w-5 mr-2 text-primary" /> Categories
                </h3>
                <div className="flex flex-col gap-3">
                  {filterOptions.categories.map((cat) => (
                    <div key={cat} className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCategory(cat)}
                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedCategories.includes(cat) ? "bg-primary border-primary" : "border-border"
                          }`}
                      >
                        {selectedCategories.includes(cat) && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3 w-3 text-primary-foreground"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                      <label
                        htmlFor={cat}
                        className="text-sm font-medium cursor-pointer text-foreground"
                        onClick={() => toggleCategory(cat)}
                      >
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenges List */}
        <div className="lg:w-3/4 w-full">
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6">
              {user ? ["all", "solved", "unsolved"].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  onClick={() => setActiveTab(tab as FilterTab)}
                  className={`text-sm py-2 px-4 w-full sm:w-auto transition-all duration-300 ${activeTab === tab
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-md"
                    : "border-border hover:border-primary text-foreground"
                    }`}
                >
                  {tab === "all" ? (
                    <span className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      All Problems
                    </span>
                  ) : tab === "solved" ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Solved
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Unsolved
                    </span>
                  )}
                </Button>
              )) : (
                <Button
                  variant={activeTab === "all" ? "default" : "outline"}
                  onClick={() => setActiveTab("all")}
                  className={`text-sm py-2 px-4 w-full sm:w-auto transition-all duration-300 ${activeTab === "all"
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-md"
                    : "border-border hover:border-primary text-foreground"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    All Problems
                  </span>
                </Button>
              )}
              <div className="relative w-full sm:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                <Input
                  className="pl-10 w-full text-sm border-border focus:border-primary transition-all duration-200 text-foreground bg-card"
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading problems...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {filteredProblems.length > 0 ? (
                  filteredProblems.map((problem, index) => (
                    <Card
                      key={problem.id}
                      className="border-1 cursor-pointer bg-card overflow-hidden h-full"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="h-full">
                        <div className="flex flex-col sm:flex-row justify-between gap-6 h-full">
                          <div className="flex-1 flex flex-col justify-between min-h-0">
                            <div className="space-y-2">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" /> {problem.date}
                              </div>
                              <h3 className="text-lg font-bold text-foreground">{problem.title}</h3>
                              {/* <p className="text-muted-foreground text-sm line-clamp-2">{problem.description}</p> */}
                              <div className="flex flex-wrap gap-1.5">
                                {problem.categories.map((cat: any) => (
                                  <Badge
                                    key={String(cat)}
                                    variant="secondary"
                                    className="text-xs py-0.5 px-2 bg-secondary dark:bg-muted text-secondary-foreground dark:text-muted-foreground"
                                  >
                                    {cat}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs mt-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getDifficultyStyle(
                                  problem.difficulty
                                )}`}
                              >
                                {getDifficultyIcon(problem.difficulty)}
                                {problem.difficulty}
                              </span>
                              <span className="flex items-center gap-1.5 bg-secondary dark:bg-muted px-2 py-1 rounded-full text-secondary-foreground dark:text-muted-foreground">
                                <Code className="h-3 w-3 text-primary" />
                                {problem.platform}
                              </span>
                            </div>
                          </div>

                          {user && (
                            <div className="sm:flex sm:flex-col sm:justify-end sm:items-end sm:min-w-0 sm:w-auto w-full">
                              <ProblemStatus
                                problem={{
                                  id: problem.id.toString(),
                                  status: activeTab === 'all' ? (user?.solveChallenges?.easy.some((item: { challenge: string }) => item.challenge === problem._id) ||
                                    user?.solveChallenges?.medium.some((item: { challenge: string }) => item.challenge === problem._id) ||
                                    user?.solveChallenges?.hard.some((item: { challenge: string }) => item.challenge === problem._id) ? "Solved" : "Unsolved") : problem.status,
                                  createdAt: new Date(problem.date),
                                  title: problem.title,
                                  description: problem.description,
                                  problemUrl: problem.problemUrl
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="shadow-lg border-0 bg-card">
                    <CardContent className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Search className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground text-lg">No problems found</p>
                        <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-sm py-2 px-6 w-full sm:w-auto border-border hover:border-primary disabled:opacity-50 text-foreground"
                  >
                    <ChevronDown className="h-4 w-4 rotate-90 ml-2" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = Math.max(1, currentPage - 2) + i;
                      if (page > totalPages) return null;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 p-0 ${currentPage === page
                              ? "bg-primary text-primary-foreground"
                              : "border-border text-foreground"
                            }`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="text-sm py-2 px-6 w-full sm:w-auto border-border hover:border-primary disabled:opacity-50 text-foreground"
                  >
                    <ChevronUp className="h-4 w-4 rotate-90 mr-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showPopup && (
        <ChallengePopup
          userStreak={user?.streak || 0}
          onClose={() => {
            setShowPopup(false);
          }}
        />
      )}
    </div>
    </>
  );
};

export default Challenges;