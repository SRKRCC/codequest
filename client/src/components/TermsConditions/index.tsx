"use client"

import { useState, useEffect } from "react"
import { FileText, User, Shield, AlertTriangle, Scale, Gavel, Mail } from "lucide-react"
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

export default function TermsConditionsPage() {
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
            icon: <FileText className="h-6 w-6" />,
            title: "Acceptance of Terms",
            content: [
                "By accessing and using the CodeQuest platform, you accept and agree to be bound by these Terms and Conditions.",
                "If you do not agree to these terms, you must not use our platform or services.",
                "These terms apply to all users, including students, educators, and administrators.",
                "Your use of the platform constitutes acceptance of any updates to these terms.",
                "We reserve the right to refuse service to anyone who violates these terms."
            ]
        },
        {
            icon: <User className="h-6 w-6" />,
            title: "User Responsibilities",
            content: [
                "Account Security: You are responsible for maintaining the confidentiality of your account credentials.",
                "Accurate Information: You must provide accurate and up-to-date information when creating your account.",
                "Appropriate Use: You must use the platform only for lawful purposes and in accordance with these terms.",
                "Code of Conduct: You must maintain respectful behavior towards other users and the SRKRCoding Club community.",
                "Challenge Integrity: You must solve challenges honestly without unauthorized assistance or cheating.",
                "Content Responsibility: You are responsible for any content you submit or share on the platform."
            ]
        },
        {
            icon: <Shield className="h-6 w-6" />,
            title: "Platform Usage Rules",
            content: [
                "No Cheating: You must not use unauthorized tools, scripts, or assistance when solving challenges.",
                "No Account Sharing: Each account must be used by only one individual and cannot be shared.",
                "No Spam: You must not send unsolicited messages or spam other users.",
                "No Malicious Activity: You must not attempt to hack, disrupt, or damage the platform or its users.",
                "Content Guidelines: All submissions and communications must be appropriate and respectful.",
                "Fair Play: You must compete fairly and honestly in all challenges and competitions."
            ]
        },
        {
            icon: <Scale className="h-6 w-6" />,
            title: "Intellectual Property",
            content: [
                "Platform Content: All platform content, including challenges, design, and code, is owned by SRKRCoding Club.",
                "User Solutions: You retain rights to your original code solutions, but grant us license to use them for platform operation.",
                "Third-Party Content: Respect intellectual property rights of third-party platforms we integrate with.",
                "Fair Use: You may use platform content for personal learning and educational purposes only.",
                "No Redistribution: You may not redistribute, sell, or commercially exploit platform content without permission.",
                "Attribution: When sharing or discussing platform content externally, please provide appropriate attribution."
            ]
        },
        {
            icon: <AlertTriangle className="h-6 w-6" />,
            title: "Account Termination",
            content: [
                "Violation-Based Termination: We reserve the right to suspend or terminate accounts that violate these terms.",
                "Immediate Suspension: Serious violations may result in immediate account suspension without prior notice.",
                "Appeal Process: Users may appeal termination decisions by contacting us within 30 days.",
                "Data Retention: Terminated accounts may have their data retained for a period as outlined in our Privacy Policy.",
                "Voluntary Termination: Users may voluntarily close their accounts at any time through profile settings.",
                "Effect of Termination: Upon termination, you lose access to all platform features and stored data."
            ]
        },
        {
            icon: <Shield className="h-6 w-6" />,
            title: "Privacy and Data Protection",
            content: [
                "Data Collection: We collect and process data as described in our Privacy Policy.",
                "User Consent: By using our platform, you consent to data collection and processing practices.",
                "Data Security: We implement reasonable security measures to protect user data.",
                "Third-Party Sharing: We may share data with integrated platforms as necessary for service provision.",
                "User Rights: You have rights regarding your personal data as outlined in our Privacy Policy.",
                "Compliance: We strive to comply with applicable data protection laws and regulations."
            ]
        },
        {
            icon: <Gavel className="h-6 w-6" />,
            title: "Limitation of Liability",
            content: [
                "Service Availability: We do not guarantee uninterrupted or error-free service availability.",
                "Content Accuracy: While we strive for accuracy, we do not warrant the accuracy of all platform content.",
                "User Actions: We are not liable for actions taken by users or consequences of user-generated content.",
                "Third-Party Services: We are not responsible for issues arising from third-party integrations or services.",
                "Damages: Our liability is limited to the maximum extent permitted by applicable law.",
                "Indemnification: Users agree to indemnify us against claims arising from their use of the platform."
            ]
        },
        {
            icon: <FileText className="h-6 w-6" />,
            title: "Modifications and Updates",
            content: [
                "Terms Updates: We may modify these terms at any time to reflect changes in our practices or legal requirements.",
                "Notification: Users will be notified of significant changes via email or platform notifications.",
                "Continued Use: Your continued use of the platform after modifications constitutes acceptance of updated terms.",
                "Version Control: We maintain version control of our terms with effective dates for reference.",
                "Legal Compliance: Modifications may be made to ensure compliance with applicable laws and regulations."
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
                                <FileText className="h-12 w-12 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold mb-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                Terms & Conditions
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Please read these terms and conditions carefully before using the CodeQuest platform operated by SRKRCoding Club.
                        </p>
                        
                    </motion.div>

                    {/* Introduction */}
                    <motion.div className="mb-8" variants={itemVariants}>
                        <Card className="border border-primary/10">
                            <CardContent className="p-6">
                                <p className="text-muted-foreground leading-relaxed">
                                    These Terms and Conditions govern your use of the CodeQuest platform operated by SRKRCoding Club 
                                    at SRKR Engineering College. The platform provides coding challenges, leaderboards, and community 
                                    features for educational purposes. By using our services, you agree to comply with these terms.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Terms Sections */}
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

                    {/* Contact and Governing Law */}
                    <motion.div className="mt-12 space-y-6" variants={containerVariants}>
                        <motion.div variants={itemVariants}>
                            <Card className="border border-primary/10">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-lg">
                                            <Scale className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-primary mb-3">Governing Law</h3>
                                            <p className="text-muted-foreground leading-relaxed">
                                                These terms are governed by the laws of India. Any disputes arising from the use of 
                                                this platform will be subject to the jurisdiction of courts in Andhra Pradesh, India.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card className="border border-primary/10 bg-primary/5">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-lg">
                                            <Mail className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-primary mb-3">Contact Information</h3>
                                            <p className="text-muted-foreground leading-relaxed mb-2">
                                                If you have any questions about these Terms and Conditions, please contact us:
                                            </p>
                                            <p className="text-muted-foreground">
                                                <strong>Email:</strong> srkrcodingclubofficial@gmail.com<br/>
                                                <strong>Organization:</strong> SRKRCoding Club, SRKR Engineering College
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
            <ScrollToTopButton />
        </div>
    )
}