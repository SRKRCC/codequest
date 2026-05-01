import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Main container */}
      <div className="relative">
        {/* Outer ring */}
        <div className="w-24 h-24 border-4 border-blue-200 rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-24 h-24 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        </div>

        {/* Inner pulsing circle */}
        <div className="absolute inset-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse">
          <div className="w-full h-full bg-white rounded-full opacity-20 animate-ping"></div>
        </div>

        {/* Center dot */}
        <div className="absolute inset-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"></div>
      </div>

      {/* Loading text with typewriter effect */}
      <div className="mt-8 text-center">
        <div className="text-2xl font-bold text-gray-700 mb-2">
          <span className="inline-block animate-pulse">Loading</span>
          <span className="inline-block animate-bounce delay-100">.</span>
          <span className="inline-block animate-bounce delay-200">.</span>
          <span className="inline-block animate-bounce delay-300">.</span>
        </div>
        <div className="text-sm text-gray-500 animate-fade-in">
          Preparing your coding adventure...
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-blue-400 rounded-full animate-float-${i % 3}`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;