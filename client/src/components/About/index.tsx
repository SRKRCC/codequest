"use client"

import { useState, useEffect, useMemo } from "react"
import {
    Calendar,
    Trophy,
    Users,
    Code,
    BookOpen,
    Zap,
    ChevronDown,
    Award,
    Rocket,
} from "lucide-react"
import { FaLinkedinIn, FaGithub } from "react-icons/fa6"
import { SiGmail } from "react-icons/si"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import SEO from "@/components/SEO/SEO"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DottedBackground } from "../dotted-background"
import ScrollToTopButton from "../scrolltotop"

// Loading skeleton component
const LoadingSkeleton = () => (
    <div className="relative w-full min-h-screen">
        <DottedBackground />
        <div className="relative z-10 container mx-auto py-10 px-4">
            <div className="animate-pulse space-y-8">
                <div className="h-12 bg-gray-300 rounded-lg w-1/2 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
                    ))}
                </div>
                <div className="h-64 bg-gray-300 rounded-lg"></div>
            </div>
        </div>
    </div>
)

export default function AboutPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("club")
    const [activeFaq, setActiveFaq] = useState<number | null>(null)

    // Memoize team members data to prevent recreating on each render
    const teamMembers = useMemo(() => [
        {
            id: 1,
            name: "William Keri",
            role: "Software Developer",
            image: "/William.webp",
            linkedin: "https://linkedin.com/in/codevoid",
            email: "williamkeri007@gmail.com",
            github: "https://github.com/codevoid048"
        },
        {
            id: 2,
            name: "Ambati Sai Ganesh",
            role: "Software Developer",
            image: "/Ganesh.webp",
            linkedin: "http://www.linkedin.com/in/sai-ganesh-ambati-8218a328a",
            email: "saiganeshambati000@gmail.com",
            github: "https://github.com/saiganesh4151"
        },
        {
            id: 3,
            name: "Chemakurthi Sai Praveen",
            role: "Software Developer",
            image: "/Praveen.webp",
            linkedin: "http://www.linkedin.com/in/praveen-cheemakurthy-149271317",
            email: "cheemakurthypraveen@gmail.com",
            github: "https://github.com/Saipraveen49"
        },
        {
            id: 4,
            name: "Ramisetti Chakrarao",
            role: "Software Developer",
            image: "/Chakri.webp",
            linkedin: "https://www.linkedin.com/in/chakri555/",
            email: "chakriramisetti555@gmail.com",
            github: "https://github.com/Chakri2759"
        },
        {
            id: 5,
            name: "Saripalli Harshavardhan",
            role: "Software Developer",
            image: "/Harsha.webp",
            linkedin: "https://www.linkedin.com/in/harshavardhansaripalli/",
            email: "harshavardhansaripalli21@gmail.com",
            github: "https://github.com/harsha2143"
        },
        {
            id: 6,
            name: "Relangi Siva Ramaraju",
            role: "Software Developer",
            image: "/Siva.webp",
            linkedin: "http://www.linkedin.com/in/veera-siva-rama-raju-relangi-2130ba259",
            email: "https://twitter.com/ambatiganesh",
            github: "https://github.com/Siva-Relangi",
        },
        {
            id: 7,
            name: "Pulavarthi Sanjay",
            role: "Software Developer",
            image: "/Sanjay1.webp",
            linkedin: "http://www.linkedin.com/in/pulavarthi-sanjay-92ba93287",
            email: "pnnksanjay@gmail.com",
            github: "https://github.com/Sanjaypulavarthi"
        },
        {
            id: 8,
            name: "Vigna Ramtej",
            role: "Software Developer",
            image: "/Ramtej.webp",
            linkedin: "https://www.linkedin.com/in/vignaramtej",
            email: "vignaramtej46@gmail.com",
            github: "https://github.com/ramtejvigna"
        },
    ], []);

    const majorEvents = useMemo(() => [
        {
            title: "CodeQuest",
            description: "CodeQuest is a platform that offers daily coding challenges to enhance problem-solving skills across all levels.",
            date: "Daily",
            icon: <Trophy className="h-6 w-6" />,
        },
        {
            title: "IconCoderz",
            description: "IconCoderz is a coding competition designed to test problem-solving skills through real-time challenges and a chance to win exciting prizes",
            date: "February",
            icon: <Rocket className="h-6 w-6" />,
        },
        {
            title: "HackOverflow",
            description: "HackOverflow is a hackathon platform where participants team up to build innovative tech solutions for real-world problems.",
            date: "October",
            icon: <Users className="h-6 w-6" />,
        },
    ], []);

    const faqItems = useMemo(() => [
        {
            question: "How can I join the SRKRCoding Club?",
            answer: "Simply sign up on our website and attend our weekly coding sessions. New members are always welcome!",
        },
        {
            question: "Is the club open to all skill levels?",
            answer: "Yes! Whether you're a beginner or an expert, we have challenges and learning paths for everyone.",
        },
        {
            question: "What kind of events do you host?",
            answer: "We organize coding contests, hackathons, guest lectures, mentorship programs, and our flagship event CodeQuest.",
        },
        {
            question: "How does CodeQuest work?",
            answer: "CodeQuest is a timed programming challenge where you solve increasingly complex problems. Your solutions are evaluated in real-time, and you compete for positions on our leaderboard.",
        },
        {
            question: "Are there any membership fees?",
            answer: "Basic membership is free for all SRKR students. Premium membership with additional benefits is available for a nominal annual fee.",
        },
        {
            question: "Can I contribute to the platform?",
            answer: "We welcome contributions from members who want to help improve our platform, new challenges, .",
        },
    ], []);

    // Simple loading effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Animation variants - consistent and simple
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    return (
        <>
            <SEO 
                title="About SRKR Coding Club"
                description="Learn about SRKR Coding Club, our mission, team members, and achievements. Founded in 2023, we're the premier technical community at SRKR Engineering College."
                keywords="SRKR Coding Club, about us, team members, coding community, SRKR Engineering College, Bhimavaram, programming club"
            />
            <div className="relative w-full min-h-screen">
                <DottedBackground />
            <motion.div 
                className="relative z-10"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="container mx-auto py-10 px-4 text-gray-800 overflow-hidden">
                    
                    {/* About CodeQuest Platform */}
                    <motion.section
                        id="codequest"
                        className="mb-20"
                        variants={itemVariants}
                    >
                        <div className="bg-transparent rounded-3xl p-10">
                            <h2 className="text-3xl font-bold text-center mb-8">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                    CodeQuest Platform
                                </span>
                            </h2>

                            <div className="max-w-4xl mx-auto text-white dark:text-muted-foreground">
                                <p className="text-lg mb-6">
                                    CodeQuest at SRKRCoding Club offers an immersive programming challenge where participants solve
                                    increasingly complex coding problems within a time limit. It features competitive leaderboards, real-time
                                    feedback, and various difficulty levels to accommodate all skill sets.
                                </p>

                                <p className="text-lg mb-6">
                                    Winners receive recognition, prizes, and opportunities to connect with industry professionals for
                                    mentorship and career advancement.
                                </p>

                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
                                    variants={containerVariants}
                                >
                                    {[
                                        {
                                            icon: <Trophy className="h-8 w-8 text-primary flex-shrink-0" />,
                                            title: "Competitive Leaderboards",
                                            description: "Track your progress and compete with peers across different skill levels."
                                        },
                                        {
                                            icon: <Zap className="h-8 w-8 text-primary flex-shrink-0" />,
                                            title: "Real-time Feedback",
                                            description: "Get immediate results and code analysis to improve your solutions."
                                        },
                                        {
                                            icon: <Code className="h-8 w-8 text-primary flex-shrink-0" />,
                                            title: "Multi-language Support",
                                            description: "Solve problems in your preferred programming language with full support."
                                        },
                                        {
                                            icon: <Users className="h-8 w-8 text-primary flex-shrink-0" />,
                                            title: "Industry Connections",
                                            description: "Connect with mentors and recruiters from top tech companies."
                                        }
                                    ].map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-start space-x-4 bg-gray-800 dark:bg-muted/100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                                            variants={cardVariants}
                                            whileHover={{ y: -2 }}
                                        >
                                            <div className="bg-primary/10 p-3 rounded-lg">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-xl mb-2 text-primary">{feature.title}</h3>
                                                <p className="text-muted-foreground">{feature.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </motion.section>

                    {/* About SRKR Coding Club */}
                    <motion.section
                        id="about"
                        className="mb-20 px-5"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-center mb-12">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                About SRKRCoding Club
                            </span>
                        </h2>

                        <Tabs defaultValue="club" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="flex justify-center mb-8">
                                <TabsList className="grid grid-cols-2 w-full max-w-md">
                                    <TabsTrigger
                                        value="club"
                                        className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300 cursor-pointer"
                                    >
                                        Our Story
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="achievements"
                                        className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300 cursor-pointer"
                                    >
                                        Achievements
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="club" className="mt-0">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
                                    <div className="lg:col-span-2">
                                        <p className="text-lg mb-4 text-muted-foreground">
                                            Founded in 2023, SRKRCoding Club is the premier technical community at SRKR Engineering College,
                                            dedicated to fostering coding excellence and innovation among students.
                                        </p>
                                        <p className="text-lg mb-4 text-muted-foreground">
                                            Founded with a vision to empower students through code, the club offers hands-on opportunities to explore technologies, build real-world projects, and grow together as future tech leaders.
                                        </p>
                                        <p className="text-lg mb-4 text-muted-foreground">
                                            With over 500 active members, we've become one of the largest and most active coding communities in
                                            the region, with alumni working at leading tech companies worldwide.
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <div className="relative bg-gray-900 dark:bg-secondary rounded-2xl p-8 shadow-lg hover:scale-105 transition-transform duration-300">
                                            <div className="flex justify-center mb-6">
                                                <div className="relative bg-white/80 dark:bg-primary-foreground rounded-full p-3">
                                                    <Award className="h-10 w-10 text-primary" />
                                                </div>
                                            </div>
                                            <h3 className="text-xl text-muted-foreground font-semibold text-center mb-4">By the Numbers</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-3 bg-primary/20 rounded-lg hover:bg-primary/40 transition-all duration-300">
                                                    <div className="text-3xl font-bold text-primary">500+</div>
                                                    <div className="text-sm text-muted-foreground">Active Members</div>
                                                </div>
                                                <div className="text-center p-3 bg-primary/20 rounded-lg hover:bg-primary/40 transition-all duration-300">
                                                    <div className="text-3xl font-bold text-primary">16+</div>
                                                    <div className="text-sm text-muted-foreground">Events Hosted</div>
                                                </div>
                                                <div className="text-center p-3 bg-primary/20 rounded-lg hover:bg-primary/40 transition-all duration-300">
                                                    <div className="text-3xl font-bold text-primary">2</div>
                                                    <div className="text-sm text-muted-foreground">Industry Partners</div>
                                                </div>
                                                <div className="text-center p-3 bg-primary/20 rounded-lg hover:bg-primary/40 transition-all duration-300">
                                                    <div className="text-3xl font-bold text-primary">2</div>
                                                    <div className="text-sm text-muted-foreground">Years of Excellence</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="achievements" className="mt-0">
                                <div className="bg-gradient-to-br p-8 rounded-2xl">
                                    <h3 className="text-xl font-semibold mb-6 text-primary text-center">Club Achievements</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            {
                                                icon: <Trophy className="h-6 w-6 text-primary" />,
                                                text: "Recognized as the Best Technical Club by SRKR Engineering College for 2 consecutive years"
                                            },
                                            {
                                                icon: <Award className="h-6 w-6 text-primary" />,
                                                text: "Successfully organized two hackathons and three coding competitions, enhancing engagement and technical skill growth among participants"
                                            },
                                            {
                                                icon: <Users className="h-6 w-6 text-primary" />,
                                                text: "Collaborated with two tech companies to promote their platforms while offering students useful insights and internship opportunities."
                                            },
                                            {
                                                icon: <Code className="h-6 w-6 text-primary" />,
                                                text: "Developed multiple open-source projects with real-world applications, including CodeQuest for PODT and a live website for SRKR Coding Club."
                                            }
                                        ].map((achievement, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start space-x-4 p-4 border border-primary/30 rounded-xl hover:bg-secondary/100 transition-colors duration-300 bg-card text-card-foreground"
                                            >
                                                <div className="bg-primary/10 p-2 rounded-full">
                                                    {achievement.icon}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-muted-foreground">
                                                        {achievement.text}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </motion.section>

                    {/* What We Offer */}
                    <motion.section
                        id="offers"
                        className="mb-20 px-5"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-center mb-12">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                What We Offer
                            </span>
                        </h2>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            variants={containerVariants}
                        >
                            {[
                                {
                                    icon: <Code className="h-8 w-8" />,
                                    title: "Daily Coding Challenges",
                                    description: "Sharpen your skills with daily problems (POTD) on the CodeQuest platform, curated for all levels — from beginner to advanced."
                                },
                                {
                                    icon: <BookOpen className="h-8 w-8" />,
                                    title: "Hackathons",
                                    description: "Collaborate and innovate at HackOverflow — our club's hackathon where participants team up to build real-world tech solutions."
                                },
                                {
                                    icon: <Trophy className="h-8 w-8" />,
                                    title: "Competitions",
                                    description: "Test your coding skills through competitions like IconCoders, organized by our club to solve challenging problems and win exciting prizes."
                                },
                                {
                                    icon: <Users className="h-8 w-8" />,
                                    title: "Workshops",
                                    description: "Gain practical knowledge through hands-on workshops organized by our club, focusing on modern technologies and industry practices."
                                },
                                {
                                    icon: <Zap className="h-8 w-8" />,
                                    title: "Courses",
                                    description: "Learn through courses conducted by our club, with live sessions covering the latest technologies and industry-relevant skills."
                                },
                                {
                                    icon: <Calendar className="h-8 w-8" />,
                                    title: "Project Collaboration",
                                    description: "Developed multiple open-source projects with real-world applications, including the CodeQuest platform and the SRKR Coding Club website."
                                }
                            ].map((offer, index) => (
                                <motion.div
                                    key={index}
                                    className="group relative overflow-hidden rounded-2xl"
                                    variants={cardVariants}
                                    whileHover={{ y: -3 }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary opacity-0 group-hover:opacity-90 transition-opacity duration-300 z-10"></div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/20"></div>
                                    <div className="relative z-20 p-8 h-full flex flex-col">
                                        <div className="flex items-center gap-3">
                                            <div className="relative bg-white dark:bg-primary-foreground rounded-full p-3 w-14 h-14 flex items-center justify-center shadow-md group-hover:bg-foreground/30 group-hover:text-white transition-colors duration-300">
                                                <div className="text-primary group-hover:text-white dark:text-primary dark:group-hover:text-gray-800 transition-colors duration-300">
                                                    {offer.icon}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-semibold text-primary group-hover:text-white transition-colors duration-300">
                                                {offer.title}
                                            </h3>
                                        </div>
                                        <p className="text-muted-foreground group-hover:text-white/90 transition-colors duration-300 mt-2">
                                            {offer.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.section>

                    {/* Major Events */}
                    <motion.section
                        id="events"
                        className="mb-20 px-5"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-center mb-12">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                Major Events
                            </span>
                        </h2>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10"
                            variants={containerVariants}
                        >
                            {majorEvents.map((event, index) => (
                                <motion.div
                                    key={index}
                                    className="relative overflow-hidden group"
                                    variants={cardVariants}
                                    whileHover={{ y: -3 }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/15 rounded-2xl -z-10"></div>
                                    <Card className="border border-primary/10 hover:border-primary/30 transition-all duration-300 group-hover:shadow-lg mb-5 h-50">
                                        <CardContent className="pb-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary/70 p-3 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                                                        {event.icon}
                                                    </div>
                                                    <h3 className="text-xl font-semibold text-primary">{event.title}</h3>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-medium"
                                                >
                                                    {event.date}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground">{event.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.section>

                    {/* Meet the Team */}
                    <motion.section
                        id="team"
                        className="mb-20 text-center"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold mb-12">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                Meet Our Team
                            </span>
                        </h2>

                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4 justify-items-center items-center"
                            variants={containerVariants}
                        >
                            {teamMembers.map((member) => (
                                <motion.div
                                    key={member.id}
                                    className="group w-full max-w-[240px]"
                                    variants={cardVariants}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="relative">
                                        <Card className="relative bg-card shadow-lg rounded-2xl p-6 text-center w-60 border-primary/10 group-hover:border-transparent transition-all duration-300">
                                            <div className="flex justify-center">
                                                <Avatar className="h-40 w-42 border-2 border-primary/20 group-hover:border-primary/50 transition-all duration-300">
                                                    <AvatarImage
                                                        src={member.image}
                                                        alt={member.name}
                                                        loading="lazy"
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {member.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <h3 className="text-xl font-semibold text-primary">{member.name}</h3>
                                            <p className="text-muted-foreground text-sm">{member.role}</p>
                                            <div className="pt-2 border-t border-primary/10 flex justify-center space-x-3">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => window.open(member.linkedin, "_blank")}
                                                >
                                                    <FaLinkedinIn className="h-5 w-5 text-primary" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => window.open(member.github, "_blank")}
                                                >
                                                    <FaGithub className="h-5 w-5 text-primary" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => window.open(member.github, "_blank")}
                                                >
                                                    <SiGmail className="h-8 w-8 text-primary" />
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.section>

                    {/* FAQ Section */}
                    <motion.section
                        id="faq"
                        className="mb-20"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-center mb-12">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/90">
                                Frequently Asked Questions
                            </span>
                        </h2>

                        <div className="max-w-3xl mx-auto">
                            {faqItems.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <div
                                        className={`border border-primary/10 rounded-lg shadow-sm p-4 cursor-pointer bg-card transition-all duration-300 ${activeFaq === index ? "bg-card" : "hover:bg-0"
                                            }`}
                                        onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                    >
                                        <div className="font-semibold text-lg text-primary flex justify-between items-center">
                                            {item.question}
                                            <motion.span
                                                animate={{ rotate: activeFaq === index ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ChevronDown className="h-5 w-5 text-primary" />
                                            </motion.span>
                                        </div>
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: activeFaq === index ? "auto" : 0,
                                                opacity: activeFaq === index ? 1 : 0,
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-muted-foreground mt-4">{item.answer}</p>
                                        </motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                </div>
            </motion.div>
            <ScrollToTopButton />
        </div>
        </>
    )
}