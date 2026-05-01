
import { motion } from "framer-motion";
import { ArrowLeft, Rocket } from "lucide-react";
import { Link } from "react-router-dom"
import React, { useEffect } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Button } from "./ui/button";

// 404 Page Component
const NotFoundPage: React.FC = () => {
    // Log to confirm component is rendering
    useEffect(() => {
        console.log("NotFoundPage component mounted");
    }, []);

    // Animation variants for the 404 text
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

    // Animation variants for the rocket
    const rocketVariants = {
        float: {
            y: [-10, 10],
            rotate: [-5, 5],
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

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-900 dark:bg-gray-100 flex items-center justify-center p-4">
                <div className="text-center space-y-8">
                    {/* Animated 404 Text */}
                    <div className="flex justify-center items-center space-x-2">
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
                            variants={rocketVariants}
                            animate="float"
                        >
                            <Rocket className="w-16 h-16 md:w-24 md:h-24 text-yellow-500 dark:text-yellow-600" />
                        </motion.div>
                        <motion.h1
                            className="text-8xl md:text-9xl font-bold text-blue-500 dark:text-blue-600"
                            variants={numberVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            4
                        </motion.h1>
                    </div>

                    {/* Animated Message */}
                    <motion.div
                        className="space-y-4"
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h2 className="text-2xl md:text-3xl font-semibold text-white dark:text-gray-900">
                            Oops! Page Not Found
                        </h2>
                        <p className="text-gray-400 dark:text-gray-600 max-w-md mx-auto">
                            It looks like you're lost in space! The page you're looking for
                            doesn't exist, or the server might be taking a nap.
                        </p>
                    </motion.div>

                    {/* Back to Home Button */}
                    <Link to="/" className="mt-6 mx-auto inline-block">
                        <Button className="flex items-center gap-2">
                            <ArrowLeft className="w-5 h-5" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default NotFoundPage;