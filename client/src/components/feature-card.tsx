import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface FeatureCardProps {
    icon: ReactNode
    title: string
    description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }} className="h-full">
            <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex-shrink-0">{icon}</div>
                        <h3 className="text-xl font-bold">{title}</h3>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{description}</p>
                </CardContent>
            </Card>
        </motion.div>

    )
}
