import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAdminStore } from "@/context/AdminContext";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { isAdminAuthenticated, logout } = useAdminStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      // console.log(isScrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  const navItems = [
    { href: "/codingclubadmin", label: "Dashboard" },
    { href: "/codingclubadmin/leaderboard", label: "Leaderboard" },
    { href: "/codingclubadmin/users", label: "Users" },
    { href: "/codingclubadmin/challenges", label: "Challenges" },
    { href: "/codingclubadmin/addchallenge", label: "Add Challenge" },
  ];

  const SidebarContent = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full p-6 bg-gradient-to-b from-background to-background/80"
    >
      <Link 
        to="/codingclubadmin" 
        className="flex items-center space-x-3 mb-10"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
        >
          <Code className="h-8 w-8 text-primary" />
        </motion.div>
        <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Admin CodeQuest
        </span>
      </Link>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <motion.div
            key={item.href}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              to={item.href}
              className={`block py-2 px-4 rounded-lg text-sm text-white dark:text-foreground font-medium transition-all duration-200 ${
                location.pathname === item.href
                  ? "bg-primary/10 text-primary  font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-primary dark:hover:bg-muted dark:hover:text-primary"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-muted">
        <motion.div

        >
          <Button
                  variant="outline"
                  onClick={() => {
                    setTheme(theme === "dark" ? "light" : "dark");
                    setIsOpen(false); // Close Sheet on theme toggle
                  }}
                  className="mt-4 w-full flex items-center justify-center gap-2 text-gray-300 dark:text-gray-600 border-gray-700 dark:border-gray-300 hover:bg-gray-700 dark:hover:bg-gray-200"
                >
                  <div className="transition-transform duration-400 group-active:rotate-360">
                    {theme === "dark" ?  <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" /> }
                  </div>
                  <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
                </Button>
        </motion.div>

        <AnimatePresence>
          {!isAdminAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col gap-2"
            >
              <Button 
                variant="outline" 
                asChild
                className="w-full bg-primary/10 text-primary"
              >
                <Link to="/codingclubadmin" onClick={() => setIsOpen(false)}>Log In</Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                variant="outline"
                className="w-full bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 text-red-500"
              >
                Logout
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return (
    <>
      <aside
        className={`hidden md:block fixed top-0 left-0 h-full w-72 z-50 border-r bg-background`}
      >
        <SidebarContent />
      </aside>

      <motion.header 
        className="md:hidden sticky top-0 z-50 w-full bg-background/90 backdrop-blur-lg border-b"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="container flex h-16 items-center justify-between px-8">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
              <Code className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              CodeQuest
            </span>
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="  hover:bg-muted">
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? (
                    <X className="h-5 w-5 text-primary dark:text-primary" />
                  ) : (
                    <Menu className="h-5 w-5 text-primary dark:text-primary" />
                  )}
                </motion.div>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r bg-primary">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </motion.header>
    </>
  );
}