"use client"

import { useState, useEffect } from "react"
import { Shield, Eye, Cookie, Database, Mail, Users } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { DottedBackground } from "../dotted-background"
import ScrollToTopButton from "../scrolltotop"

// Loading skeleton component
const LoadingSkeleton = () => (
    <div className="relative w-full min-h-screen">
        <DottedBackground />
        <div className="relative z-10 container mx-auto py-10 px-4">
            <div className="animate-pulse space-y-8">
                <div className="h-12 bg-gray-300 rounded-lg w-1/2 mx-auto"></div>
                <div className="space-y-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
)

export default function PrivacyPolicyPage() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    }

    const sections = [
        {
            icon: <Eye className="h-6 w-6" />,
            title: "Information We Collect",
            content: [
                "Account Information: When you create an account, we collect your username, email address, college name, and profile information.",
                "Coding Activity: We track your participation in daily challenges, submissions, scores, and leaderboard rankings.",
                "Platform Integration: We may collect data from integrated platforms like LeetCode, CodeChef, and GeeksforGeeks to track your coding progress."
            ]
        },
        {
            icon: <Database className="h-6 w-6" />,
            title: "How We Use Your Information",
            content: [
                "Platform Functionality: To provide core features like challenges, leaderboards, and profile management.",
                "Performance Tracking: To monitor your coding progress and provide personalized recommendations.",
                "Communication: To send important updates about challenges, events, and platform changes.",
                "Community Features: To enable interactions within the SRKRCoding Club community.",
                "Platform Improvement: To analyze usage patterns and improve our services.",
                "Security: To protect against fraud, unauthorized access, and maintain platform security."
            ]
        },
        {
            icon: <Users className="h-6 w-6" />,
            title: "Information Sharing",
            content: [
                "Public Information: Your username, college, and leaderboard rankings are publicly visible to other users.",
                "Third-Party Integrations: We may share necessary data with coding platforms (LeetCode, CodeChef, GFG) to sync your progress.",
                "Service Providers: We may share data with trusted service providers who help us operate the platform.",
                "Legal Requirements: We may disclose information if required by law or to protect our rights and users' safety.",
                "We do not sell, rent, or trade your personal information to third parties for marketing purposes."
            ]
        },
        {
            icon: <Cookie className="h-6 w-6" />,
            title: "Cookies and Tracking",
            content: [
                "Essential Cookies: We use cookies necessary for platform functionality, such as keeping you logged in.",
                "Analytics Cookies: We may use cookies to understand how users interact with our platform to improve services.",
                "Preference Cookies: We store your settings and preferences to enhance your user experience.",
                "You can manage cookie preferences through your browser settings, though some features may not work properly if disabled."
            ]
        },
        {
            icon: <Shield className="h-6 w-6" />,
            title: "Data Security",
            content: [
                "Encryption: We use industry-standard encryption to protect data in transit and at rest.",
                "Access Controls: We implement strict access controls to limit who can access your personal information.",
                "Regular Audits: We regularly review and update our security practices to protect user data.",
                "Incident Response: We have procedures in place to respond to potential security breaches promptly.",
                "While we implement strong security measures, no system is 100% secure. We encourage users to use strong, unique passwords."
            ]
        },
        {
            icon: <Database className="h-6 w-6" />,
            title: "Data Retention",
            content: [
                "Active Accounts: We retain your data as long as your account is active and you continue using our services.",
                "Inactive Accounts: We may retain data from inactive accounts for a reasonable period to allow for account reactivation.",
                "Legal Requirements: Some data may be retained longer if required by law or for legitimate business purposes.",
                "Data Deletion: You can request deletion of your account and associated data by contacting us.",
                "Anonymized Data: We may retain anonymized, non-personally identifiable data for analytics and platform improvement."
            ]
        },
        {
            icon: <Users className="h-6 w-6" />,
            title: "Your Rights",
            content: [
                "Access: You can request access to the personal information we have about you.",
                "Correction: You can update or correct your personal information through your profile settings.",
                "Deletion: You can request deletion of your account and associated data.",
                "Data Portability: You can request a copy of your data in a portable format.",
                "Opt-out: You can opt out of non-essential communications and certain data processing activities.",
                "To exercise these rights, please contact us at srkrcodingclubofficial@gmail.com."
            ]
        },
        {
            icon: <Mail className="h-6 w-6" />,
            title: "Contact Information",
            content: [
                "If you have questions about this Privacy Policy or our data practices, please contact us:",
                "Email: srkrcodingclubofficial@gmail.com",
                "Organization: SRKRCoding Club, SRKR Engineering College",
                "We will respond to privacy-related inquiries within 30 days.",
                "For urgent privacy concerns, please mark your email as 'URGENT - Privacy Concern'."
            ]
        }
    ]

    if (isLoading) {
        return <LoadingSkeleton />
    }

    return (
        <div className="relative w-full min-h-screen">
            <DottedBackground />
            <motion.div
                className="relative z-10"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="container mx-auto py-10 px-4 text-gray-800 max-w-4xl">
                    {/* Header */}
                    <motion.div className="text-center mb-12" variants={itemVariants}>
                        <div className="flex justify-center mb-6">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <Shield className="h-12 w-12 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold mb-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                Privacy Policy
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Your privacy is important to us. This policy explains how we collect, use, and protect your information on the CodeQuest platform.
                        </p>
                        
                    </motion.div>

                    {/* Introduction */}
                    <motion.div className="mb-8" variants={itemVariants}>
                        <Card className="border border-primary/10">
                            <CardContent className="p-6">
                                <p className="text-muted-foreground leading-relaxed">
                                    Welcome to CodeQuest, operated by SRKRCoding Club. This Privacy Policy describes how we collect, 
                                    use, disclose, and safeguard your information when you use our coding challenge platform. 
                                    By using our services, you agree to the practices described in this policy.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Policy Sections */}
                    <motion.div className="space-y-8" variants={containerVariants}>
                        {sections.map((section, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <Card className="border border-primary/10 hover:border-primary/20 transition-colors duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                                                <div className="text-primary">
                                                    {section.icon}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-xl font-semibold text-primary mb-4">
                                                    {section.title}
                                                </h2>
                                                <ul className="space-y-3">
                                                    {section.content.map((item, itemIndex) => (
                                                        <li key={itemIndex} className="flex items-start gap-3">
                                                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                                            <span className="text-muted-foreground leading-relaxed">
                                                                {item}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Policy Updates */}
                    <motion.div className="mt-12" variants={itemVariants}>
                        <Card className="border border-primary/10 bg-primary/5">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-primary mb-3">Policy Updates</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We may update this Privacy Policy from time to time to reflect changes in our practices or 
                                    applicable law. We will notify users of significant changes via email or platform notifications. 
                                    Your continued use of the platform after such modifications constitutes acceptance of the updated policy.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
            <ScrollToTopButton />
        </div>
    )
}