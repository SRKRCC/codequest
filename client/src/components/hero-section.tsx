import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ParticlesBackground } from "@/components/particles-background"
import { useAuth } from "@/context/AuthContext"

type Stats = {
  usersCount: number
  challengesCount: number
}

interface HeroSectionProps {
  stats: Stats
}

export function HeroSection({ stats }: HeroSectionProps) {
    const [mounted, setMounted] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-16 pb-24 md:py-24 lg:py-32 flex justify-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6"
                >
                    Daily coding challenges for everyone
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl mb-6 text-center"
                >
                    Level Up Your <span className="text-primary">Coding Skills</span> One Challenge at a Time
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="max-w-[700px] text-muted-foreground md:text-xl mb-8 text-center"
                >
                    CodeQuest delivers daily coding challenges to help you build a consistent coding habit, improve your
                    problem-solving skills, and prepare for technical interviews.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Button asChild size="lg" className="group">
                        <Link to={`${!user ? '/register' : '/challenges'}`}>
                            Start Your Journey
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link to="/challenges">Explore Challenges</Link>
                    </Button>
                </motion.div>

                {/* ✅ Fixed Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="w-full max-w-4xl mx-auto mt-12 relative"
                >
                    <ParticlesBackground />
                    <div className="relative z-10 flex flex-wrap justify-center gap-4 py-8">
                        <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border">
                            <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium">
                                {stats?.usersCount?.toLocaleString() || 0} active users
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border">
                            <div className="size-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium">
                                {stats?.challengesCount?.toLocaleString() || 0} coding challenges
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border">
                            <div className="size-2 bg-purple-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium">Join our growing community</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}
