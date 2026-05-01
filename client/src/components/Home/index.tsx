import { useEffect, useState } from "react"
import { ArrowRight, Code, Trophy, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DailyChallengeCard } from "@/components/daily-challenge-card"
import { HeroSection } from "@/components/hero-section"
import { FeatureCard } from "@/components/feature-card"
import { useAuth } from "@/context/AuthContext"
import ScrollToTopButton from "../scrolltotop"
import SEO from "../SEO/SEO"

const Home = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ usersCount: 0, challengesCount: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/stats`);
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <>
        <SEO 
            title="CodeQuest - Daily Coding Challenges for Students"
            description="Join CodeQuest for daily coding challenges, competitive programming, and skill building. Learn algorithms, data structures, and problem-solving with our community of coders."
            keywords="coding challenges, programming contests, algorithms, data structures, competitive programming, coding practice"
        />
        <div className="px-1">
            <HeroSection stats={stats} />

            <section className="container mx-auto py-12 space-y-6 md:py-16 lg:py-24 flex flex-col items-center">
                <div className="text-center space-y-4 max-w-[900px]">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How CodeQuest Works</h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                        Join thousands of students improving their coding skills with daily challenges
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 w-full max-w-[1200px]">
                    <FeatureCard
                        icon={<Code className="h-10 w-10 text-primary" />}
                        title="Daily Challenges"
                        description="New coding problems every day across different difficulty levels and programming concepts"
                    />
                    <FeatureCard
                        icon={<Users className="h-10 w-10 text-primary" />}
                        title="Community Learning"
                        description="Share solutions, discuss approaches, and learn from peers in a collaborative environment"
                    />
                    <FeatureCard
                        icon={<Trophy className="h-10 w-10 text-primary" />}
                        title="Track Progress"
                        description="Earn points, unlock achievements, and climb the leaderboard as you solve more challenges"
                    />
                </div>
            </section>

            <section className="bg-muted py-12 md:py-16 lg:py-24">
                <div className="container mx-auto space-y-8 flex flex-col items-center max-w-4xl">
                    <div className="text-center space-y-4 w-full">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Today's Challenge</h2>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                            Solve today's problem and start your coding streak
                        </p>
                    </div>

                    <div className="w-full">
                        <DailyChallengeCard />
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button asChild size="lg" className="group">
                            <Link to="/challenges">
                                View All Challenges
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section className="container mx-auto py-12 space-y-8 md:py-16 lg:py-24 flex flex-col items-center">
                <div className="text-center space-y-4 w-full max-w-4xl">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join Our Community</h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                        Connect with other coders, share your solutions, and learn together
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 w-full max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>{stats.usersCount.toLocaleString()}+</CardTitle>
                            <CardDescription>Active Users</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Join a thriving community of coders from around the world.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{stats.challengesCount.toLocaleString()}+</CardTitle>
                            <CardDescription>Challenges</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Access our growing library of coding challenges across all difficulty levels.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>24/7</CardTitle>
                            <CardDescription>Support</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Get help from our community and mentors whenever you need it.</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center pt-8 w-full">
                    <Button asChild size="lg" variant="secondary" className="group">
                        <Link to={`${!user ? '/register' : '/challenges'}`}>
                            Start Coding Today
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </section>

            <ScrollToTopButton />
        </div>
        </>
    )
}

export default Home
