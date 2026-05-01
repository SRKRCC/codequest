import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import darkImage from "@/assets/darkImage.webp";
import lightImage from "@/assets/lightImage.webp";

interface ChallengePopupProps {
  userStreak: number;
  onClose: () => void;
}

// Popup component for celebrating challenge completion
const ChallengePopup: React.FC<ChallengePopupProps> = ({ userStreak, onClose }) => {
  return (
    <>
      <style>
        {`
          @keyframes slideUpBounce {
            0% {
              transform: translateY(100vh);
              opacity: 0;
            }
            70% {
              transform: translateY(-20px);
              opacity: 1;
            }
            85% {
              transform: translateY(10px);
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes flip {
            0% { transform: rotateY(0deg); }
            50% { transform: rotateY(180deg); }
            100% { transform: rotateY(360deg); }
          }
          @keyframes pulseGlow {
            0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
            50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
            100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          }
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
          .toaster-popup {
            animation: slideUpBounce 0.6s ease-out forwards;
          }
          .animate-flip-inline {
            animation: flip 1.5s ease-in-out infinite;
            transform-style: preserve-3d;
            position: relative;
          }
          .glow-effect {
            animation: pulseGlow 2s infinite ease-in-out;
          }
          .float-effect {
            animation: float 3s infinite ease-in-out;
          }
        `}
      </style>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 py-8">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl text-center toaster-popup border border-gray-200 dark:border-gray-700 max-w-sm w-full glow-effect shadow-2xl">
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 animate-flip-inline">
              <img
                src={document.documentElement.classList.contains("dark") ? darkImage : lightImage}
                alt="SRKR Coding Club"
                className="w-full h-full object-contain rounded-full shadow-lg border-2 transform transition-transform hover:scale-110"
              />
            </div>
          </div>
          {/* Text Section */}
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 animate-fade-in-down">
            Streak: <span className="text-blue-500">{userStreak}</span> Day{userStreak !== 1 ? "s" : ""}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 float-effect">
            Keep the streak alive — see you tomorrow!
          </p>
          {/* Close Button */}
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 w-full py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={onClose}
          >
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 animate-pulse" />
              Awesome, Got It!
            </span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default ChallengePopup;