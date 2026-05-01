import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Menu, Moon, Sun, Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "../../context/ThemeContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../lib/useDebounce";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State for Sheet open/closed
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Close mobile menu when screen size becomes large (>=1120px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1120) {
        setIsOpen(false); // Close Sheet on large screens
      }
    };

    // Check on mount and resize
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/challenges", label: "Challenges" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/about", label: "About" },
  ];

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedQuery) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      try {
        setLoading(true);
        setShowDropdown(true);

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/search?q=${debouncedQuery}`, {
          credentials: "include",
        });
        const data = await res.json();

        const results = Array.isArray(data) ? data : data.results;
        setSearchResults(results || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showDropdown && !(event.target as Element).closest(".search-container")) {
        setShowDropdown(false);
      }
      if (showProfileDropdown && !(event.target as Element).closest(".profile-dropdown-container")) {
        setShowProfileDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown, showProfileDropdown]);

  const renderResultItem = (item: any, idx: number) => {
    if (item.type === "challenge") {
      return (
        <div
          key={idx}
          className="p-2 hover:bg-gray-700 dark:hover:bg-gray-200 cursor-pointer rounded-md"
          onClick={() => {
            navigate(`/challenge/${item.id}`);
            setShowDropdown(false);
            setIsOpen(false); // Close Sheet on click
          }}
        >
          <p className="font-semibold text-white dark:text-gray-900">{item.title}</p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            {item.difficulty} — {item.description?.slice(0, 80)}
          </p>
        </div>
      );
    } else if (item.type === "user") {
      return (
        <div
          key={idx}
          className="p-2 hover:bg-gray-700 dark:hover:bg-gray-200 cursor-pointer flex items-center gap-2 rounded-md"
          onClick={() => {
            navigate(`/profile/${item.username}`);
            setShowDropdown(false);
            setIsOpen(false); // Close Sheet on click
          }}
        >
          {item?.profilePicture ? (
            <img src={item.profilePicture || "/placeholder.svg"} alt="Profile" className="w-8 h-8 rounded-full" />
          ) : (
            (() => {
              const initial = item?.username ? item.username.charAt(0).toUpperCase() : "U";
              return (
                <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                  <span className="text-white dark:text-gray-900 font-medium text-sm">{initial}</span>
                </div>
              );
            })()
          )}
          <div>
            <p className="font-semibold text-white dark:text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              @{item.username} — {item.collegeName}, {item.branch}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderUserAvatar = () => {
    if (user?.profilePicture) {
      return <img src={user.profilePicture || "/placeholder.svg"} alt="Profile" className="w-8 h-8 rounded-full" />;
    } else {
      const initial = user?.username ? user.username.charAt(0).toUpperCase() : "U";
      return (
        <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
          <span className="text-white dark:text-gray-900 font-medium text-sm">{initial}</span>
        </div>
      );
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? "bg-gray-900/80 dark:bg-gray-100/80 backdrop-blur-md border-b border-gray-700 dark:border-gray-200" : "bg-transparent"
        }`}
    >
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            {/* <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 5 }}
            >
              <Code className="h-6 w-6 text-blue-500 dark:text-blue-600" />
            </motion.div> */}
            <img src="/Clublogo.webp" alt="" width={40} height={40} className="rounded-full" />
            <p className="flex flex-col">
              <span className="font-bold text-xl text-white tracking-wide dark:text-gray-900">CodeQuest</span>
              <span className="text-right text-[8px] font-bold">SRKR Coding Club</span>
            </p>
          </Link>
        </div>


        <div className="hidden min-[1120px]:flex items-center gap-3 px-5">

          <div className="relative search-container px-3">
            <div className="flex items-center space-x-2 border border-gray-700 dark:border-gray-300 rounded-md px-3 py-2 bg-gray-800 dark:bg-white text-white dark:text-gray-900">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowDropdown(true)}
                placeholder="Search challenges, users..."
                className="bg-transparent focus:outline-none text-sm w-60"
              />
              {loading && <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-600" />}
              {searchQuery && !loading && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-gray-400 dark:text-gray-600"
                  onClick={() => {
                    setSearchQuery("");
                    setShowDropdown(false);
                  }}
                >
                  <span className="sr-only">Clear search</span>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute mt-1 w-full bg-gray-800 dark:bg-white border border-gray-700 dark:border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto"
                >
                  {searchResults.length > 0
                    ? searchResults.map(renderResultItem)
                    : debouncedQuery.length > 0 && !loading && (
                      <div className="p-4 text-sm text-center text-gray-400 dark:text-gray-600">No results found</div>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <nav className="hidden min-[1120px]:flex gap-6 pr-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-500 dark:hover:text-blue-600 ${location.pathname === item.href ? "text-blue-500 dark:text-blue-600" : "text-gray-300 dark:text-gray-600"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="mr-2 text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-600"
            >
              <div className="transition-transform duration-400 group-active:rotate-360">
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </div>
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {!isAuthenticated ? (
            <Button asChild className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600">
              <Link to="/register">Enter</Link>
            </Button>
          ) : (
            <div className="relative profile-dropdown-container">
              <Button 
                variant="ghost" 
                className="p-0 h-auto"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                {renderUserAvatar()}
              </Button>
              
              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-32 bg-gray-800 dark:bg-white border border-gray-700 dark:border-gray-200 rounded-md shadow-lg z-50 overflow-hidden"
                  >
                    <Link
                      to={`/profile/${user?.username}`}
                      className="block px-4 py-2 text-sm text-gray-300 dark:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 dark:text-red-600 hover:bg-red-600/20 dark:hover:bg-red-100 hover:text-red-300 dark:hover:text-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="max-[1119px]:block hidden text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-600">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 w-[300px] sm:w-[400px] p-6">
            <div className="flex flex-col h-full gap-6">
              <Link
                to="/"
                className="flex items-center space-x-2 mb-4"
                onClick={() => setIsOpen(false)} // Close Sheet on logo click
              >
                <Code className="h-8 w-8 text-blue-500 dark:text-blue-600" />
                <span className="font-bold text-2xl">CodeQuest</span>
              </Link>

              <div className="relative search-container mb-6">
                <div className="flex items-center space-x-2 border border-gray-700 dark:border-gray-300 rounded-md px-3 py-2 bg-gray-800 dark:bg-white">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowDropdown(true)}
                    placeholder="Search challenges, users..."
                    className="bg-transparent focus:outline-none text-sm w-full text-white dark:text-gray-900"
                  />
                  {loading && <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-600" />}
                  {searchQuery && !loading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-gray-400 dark:text-gray-600"
                      onClick={() => {
                        setSearchQuery("");
                        setShowDropdown(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute mt-1 w-full bg-gray-800 dark:bg-white border border-gray-700 dark:border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                    >
                      {searchResults.length > 0
                        ? searchResults.map(renderResultItem)
                        : debouncedQuery.length > 0 && !loading && (
                          <div className="p-4 text-sm text-center text-gray-400 dark:text-gray-600">No results found</div>
                        )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`text-base font-medium transition-colors hover:text-blue-500 dark:hover:text-blue-600 py-2 px-3 rounded-md ${location.pathname === item.href
                      ? "bg-blue-600 dark:bg-blue-500 text-white dark:text-white"
                      : "text-gray-300 dark:text-gray-600"
                      }`}
                    onClick={() => setIsOpen(false)} // Close Sheet on link click
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              {mounted && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setTheme(theme === "dark" ? "light" : "dark");
                    setIsOpen(false); // Close Sheet on theme toggle
                  }}
                  className="mt-4 w-full flex items-center justify-center gap-2 text-gray-300 dark:text-gray-600 border-gray-700 dark:border-gray-300 hover:bg-gray-700 dark:hover:bg-gray-200"
                >
                  <div className="transition-transform duration-400 group-active:rotate-360">
                    {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </div>
                  <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
                </Button>
              )}

              <div className="mt-6 pt-6 border-t border-gray-700 dark:border-gray-200">
                {!isAuthenticated ? (
                  <Button
                    asChild
                    className="w-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                    onClick={() => setIsOpen(false)} // Close Sheet on click
                  >
                    <Link to="/register">Enter</Link>
                  </Button>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      {renderUserAvatar()}
                      <div>
                        <p className="font-semibold text-white dark:text-gray-900">{user?.name || user?.username}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-600">@{user?.username}</p>
                      </div>
                    </div>
                    <Link to={`/profile/${user?.username}`}>
                      <Button
                        variant="outline"
                        className="w-full text-gray-300 dark:text-gray-600 border-gray-700 dark:border-gray-300 hover:bg-gray-700 dark:hover:bg-gray-200"
                        onClick={() => setIsOpen(false)} // Close Sheet on click
                      >
                        View Profile
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        logout();
                        setIsOpen(false); // Close Sheet on logout
                      }}
                      variant="outline"
                      className="w-full text-gray-300 dark:text-gray-600 border-gray-700 dark:border-gray-300 hover:bg-gray-700 dark:hover:bg-gray-200"
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}