import React, { useState, useEffect } from 'react';

interface Paper {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: string;
}

const ConfettiPapers: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [hasPlayed, setHasPlayed] = useState(false);

  const colors = [
    'bg-red-600',
    'bg-yellow-600', 
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-orange-600',
    'bg-indigo-500',
    'bg-teal-600',
    'bg-rose-600',
    'bg-emerald-600'
  ];

  const sizes = ['w-1 h-1', 'w-1 h-2', 'w-1 h-3', 'w-1 h-4'];

  useEffect(() => {
    // Check if confetti has already been played from localStorage
    const alreadyPlayed = localStorage.getItem("confettiPlayed");

    if (!alreadyPlayed) {
      const generatePapers = () => {
        const newPapers: Paper[] = [];
        for (let i = 0; i < 500; i++) {
          newPapers.push({
            id: i,
            x: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 1.5,
            duration: 3 + Math.random() * 2,
            size: sizes[Math.floor(Math.random() * sizes.length)]
          });
        }
        setPapers(newPapers);
        setHasPlayed(true);
        // Save to localStorage so it won’t play again
        localStorage.setItem("confettiPlayed", "true");
      };

      generatePapers();

      // Clean up after animation
      const cleanup = setTimeout(() => {
        setPapers([]);
      }, 6000);

      return () => clearTimeout(cleanup);
    }
  }, []);

  if (!hasPlayed) return null; // Don’t render if animation not triggered

  return (
    <>
      {/* Confetti Papers Container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {papers.map((paper) => (
          <div
            key={paper.id}
            className={`absolute ${paper.color} ${paper.size}`}
            style={{
              left: `${paper.x}%`,
              top: '-20px',
              animationName: 'paperFall',
              animationDuration: `${paper.duration}s`,
              animationDelay: `${paper.delay}s`,
              animationTimingFunction: 'ease-in',
              animationFillMode: 'forwards'
            }}
          />
        ))}
      </div>

      {/* CSS Animation Styles */}
      <style>{`
        @keyframes paperFall {
          0% {
            transform: translateY(-20px) rotateZ(0deg);
            opacity: 1;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 20px)) rotateZ(720deg);
            opacity: 0.3;
          }
        }
      `}</style>
    </>
  );
};

export default ConfettiPapers;