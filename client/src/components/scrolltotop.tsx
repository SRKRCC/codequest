import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./ui/button"; // Adjust path as needed

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Show button when page is scrolled down
  const toggleVisibility = (): void => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <Button
      size="icon"
      variant="default"
      className={`fixed bottom-4 right-4 rounded-full shadow-lg transition-opacity duration-300 w-14 h-14 z-40 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-12 w-12" />
    </Button>
  );
};

export default ScrollToTopButton;
