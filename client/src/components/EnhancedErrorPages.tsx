import { motion } from "framer-motion";
import { ArrowLeft, Rocket, AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";
import React, { useEffect } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Button } from "./ui/button";

// Enhanced 404/Error Page Props
interface ErrorPageProps {
  errorType?: 'notFound' | 'serverError' | 'networkError' | 'forbidden' | 'unauthorized';
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  customIcon?: React.ReactNode;
}

// Error configurations for different types
const errorConfigs = {
  notFound: {
    icon: <Rocket className="w-16 h-16 md:w-24 md:h-24 text-yellow-500 dark:text-yellow-600" />,
    title: "Oops! Page Not Found",
    message: "It looks like you're lost in space! The page you're looking for doesn't exist, or the server might be taking a nap.",
    showRetry: false
  },
  serverError: {
    icon: <AlertTriangle className="w-16 h-16 md:w-24 md:h-24 text-red-500 dark:text-red-600" />,
    title: "Server Error",
    message: "Something went wrong on our servers. Our team has been notified and is working on a fix.",
    showRetry: true
  },
  networkError: {
    icon: <AlertTriangle className="w-16 h-16 md:w-24 md:h-24 text-orange-500 dark:text-orange-600" />,
    title: "Connection Problem",
    message: "Unable to connect to our servers. Please check your internet connection and try again.",
    showRetry: true
  },
  forbidden: {
    icon: <AlertTriangle className="w-16 h-16 md:w-24 md:h-24 text-red-500 dark:text-red-600" />,
    title: "Access Denied",
    message: "You don't have permission to access this resource. Please contact support if you think this is a mistake.",
    showRetry: false
  },
  unauthorized: {
    icon: <AlertTriangle className="w-16 h-16 md:w-24 md:h-24 text-blue-500 dark:text-blue-600" />,
    title: "Authentication Required",
    message: "Please log in to access this resource.",
    showRetry: false
  }
};

// Enhanced Error Page Component
const EnhancedErrorPage: React.FC<ErrorPageProps> = ({
  errorType = 'notFound',
  title,
  message,
  showRetry,
  onRetry,
  customIcon
}) => {
  const config = errorConfigs[errorType];
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayShowRetry = showRetry !== undefined ? showRetry : config.showRetry;
  const displayIcon = customIcon || config.icon;

  useEffect(() => {
    console.log(`ErrorPage component mounted - Type: ${errorType}`);
  }, [errorType]);

  // Animation variants for the error code
  const numberVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.2,
      } as const,
    },
  };

  // Animation variants for the icon
  const iconVariants = {
    float: {
      y: [-10, 10],
      rotate: errorType === 'notFound' ? [-5, 5] : [0, 0],
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as const,
        duration: 2,
      },
    },
  };

  // Animation variants for the message
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.4,
        duration: 0.5,
      },
    },
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        {/* Animated Error Display */}
        <div className="flex justify-center items-center space-x-2">
          {errorType === 'notFound' ? (
            <>
              <motion.h1
                className="text-8xl md:text-9xl font-bold text-blue-500 dark:text-blue-600"
                variants={numberVariants}
                initial="hidden"
                animate="visible"
              >
                4
              </motion.h1>
              <motion.div
                className="relative"
                variants={iconVariants}
                animate="float"
              >
                {displayIcon}
              </motion.div>
              <motion.h1
                className="text-8xl md:text-9xl font-bold text-blue-500 dark:text-blue-600"
                variants={numberVariants}
                initial="hidden"
                animate="visible"
              >
                4
              </motion.h1>
            </>
          ) : (
            <motion.div
              className="relative"
              variants={iconVariants}
              animate="float"
            >
              {displayIcon}
            </motion.div>
          )}
        </div>

        {/* Animated Message */}
        <motion.div
          className="space-y-4"
          variants={messageVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-white dark:text-gray-900">
            {displayTitle}
          </h2>
          <p className="text-gray-400 dark:text-gray-600 max-w-md mx-auto">
            {displayMessage}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Link to="/">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          
          {displayShowRetry && (
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}

          {errorType === 'unauthorized' && (
            <Link to="/login">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go to Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapped with Error Boundary
const SafeErrorPage: React.FC<ErrorPageProps> = (props) => (
  <ErrorBoundary>
    <EnhancedErrorPage {...props} />
  </ErrorBoundary>
);

// Export both the original 404 and the enhanced version
export const NotFoundPage: React.FC = () => (
  <SafeErrorPage errorType="notFound" />
);

export const ServerErrorPage: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <SafeErrorPage errorType="serverError" onRetry={onRetry} />
);

export const NetworkErrorPage: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <SafeErrorPage errorType="networkError" onRetry={onRetry} />
);

export const ForbiddenPage: React.FC = () => (
  <SafeErrorPage errorType="forbidden" />
);

export const UnauthorizedPage: React.FC = () => (
  <SafeErrorPage errorType="unauthorized" />
);

export default SafeErrorPage;