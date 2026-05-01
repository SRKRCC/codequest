import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Profile Details Skeleton */}
                <div className="lg:col-span-1">
                    <Card className="overflow-hidden shadow-lg border-0">
                        <Skeleton className="h-24 w-full" />
                        <div className="px-6 pb-6 -mt-12">
                            <Skeleton className="w-24 h-24 rounded-full mx-auto" />

                            <div className="mt-4 text-center">
                                <Skeleton className="h-8 w-48 mx-auto" />
                                <Skeleton className="h-6 w-32 mx-auto mt-2" />

                                <div className="mt-2">
                                    <Skeleton className="h-5 w-32 mx-auto" />
                                </div>

                                <div className="mt-5 space-y-3">
                                    <Skeleton className="h-5 w-48 mx-auto" />
                                    <Skeleton className="h-5 w-40 mx-auto" />
                                    <Skeleton className="h-5 w-44 mx-auto" />
                                </div>

                                <div className="mt-6 flex justify-center gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>

                                <div className="mt-6">
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Coding Platforms Skeleton */}
                    <Card className="shadow-lg border-0 mt-6">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="border-l-4 rounded-lg shadow-sm p-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <Skeleton className="h-5 w-24" />
                                            <Skeleton className="h-4 w-20 mt-1" />
                                        </div>
                                        <Skeleton className="h-6 w-12" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Skeleton */}
                <div className="lg:col-span-3">
                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="shadow-lg border-0 overflow-hidden">
                                <Skeleton className="h-1 w-full" />
                                <CardContent className="pt-6">
                                    <div className="flex items-center">
                                        <Skeleton className="h-12 w-12 rounded-lg mr-4" />
                                        <div>
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-8 w-16 mt-1" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Problem Difficulty Breakdown Skeleton */}
                    <Card className="shadow-lg border-0 mt-6">
                        <CardHeader>
                            <Skeleton className="h-6 w-64" />
                            <Skeleton className="h-4 w-48 mt-1" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="text-center p-6 rounded-xl shadow-sm">
                                        <Skeleton className="w-28 h-28 rounded-full mx-auto" />
                                        <Skeleton className="h-5 w-16 mx-auto mt-3" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contributions Map Skeleton */}
                    <Card className="shadow-lg border-0 mt-6">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                            <Skeleton className="h-4 w-48 mt-1" />
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto pb-4">
                                <div className="min-w-[950px]">
                                    <div className="flex gap-4 mb-2">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <Skeleton key={i} className="flex-1 h-4" />
                                        ))}
                                    </div>
                                    <div className="flex gap-4">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <div key={i} className="flex-1">
                                                <Skeleton className="h-40 w-full" />
                                                <Skeleton className="h-4 w-full mt-1" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-4">
                                    <Skeleton className="h-4 w-8" />
                                    <Skeleton className="h-3 w-3 rounded-sm" />
                                    <Skeleton className="h-3 w-3 rounded-sm" />
                                    <Skeleton className="h-3 w-3 rounded-sm" />
                                    <Skeleton className="h-3 w-3 rounded-sm" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

