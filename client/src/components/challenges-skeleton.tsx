import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChallengesSkeleton() {
    return (
        <div className="w-full max-w-[1040px] mx-auto px-4 py-5 space-y-8">
            {/* Daily Challenge Skeleton */}
            <Card className="border-1 shadow-xl bg-card rounded-xl overflow-hidden relative">
                <CardContent className="p-1 sm:p-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-lg mr-3" />
                            <Skeleton className="h-8 w-48" />
                        </div>
                        <Skeleton className="h-10 w-48" />
                    </div>

                    <Card className="border-1 rounded-xl overflow-hidden mt-4">
                        <CardContent>
                            <div className="flex flex-col sm:flex-row justify-between gap-6">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-8 w-full max-w-md" />
                                    <Skeleton className="h-16 w-full" />
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <Skeleton key={i} className="h-6 w-20" />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 justify-center">
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-4">
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-8 w-32 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            {/* Main Content Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Filters Panel Skeleton */}
                <div className="lg:w-1/4 w-full">
                    <Card className="shadow-lg border-0 bg-card">
                        <CardContent className="p-6 space-y-6">
                            <div>
                                <Skeleton className="h-6 w-32 mb-4" />
                                <div className="flex flex-col gap-3">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="h-5 w-5 rounded-md" />
                                            <Skeleton className="h-5 w-24" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Skeleton className="h-1 w-full" />
                            <div>
                                <Skeleton className="h-6 w-32 mb-4" />
                                <div className="flex flex-col gap-3">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="h-5 w-5 rounded-md" />
                                            <Skeleton className="h-5 w-24" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Problems Listing Skeleton */}
                <div className="lg:w-3/4 w-full">
                    <div className="space-y-4 mb-6">
                        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full sm:w-32" />
                            ))}
                            <Skeleton className="h-10 w-full sm:w-64" />
                        </div>
                    </div>

                    {/* Problems Display Skeleton */}
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Card key={i} className="border-1 bg-card overflow-hidden">
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-6 w-full max-w-md" />
                                            <Skeleton className="h-4 w-full" />
                                            <div className="flex flex-wrap gap-1.5">
                                                {Array.from({ length: 3 }).map((_, j) => (
                                                    <Skeleton key={j} className="h-5 w-16" />
                                                ))}
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                                <Skeleton className="h-6 w-24 rounded-full" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-10 w-24 self-start sm:self-center" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination Skeleton */}
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Skeleton className="h-10 w-full sm:w-32" />
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-8 w-8" />
                            ))}
                        </div>
                        <Skeleton className="h-10 w-full sm:w-32" />
                    </div>
                </div>
            </div>
        </div>
    )
}

