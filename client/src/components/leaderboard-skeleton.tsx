import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LeaderboardSkeleton() {
    return (
        <div className="w-full max-w-[1040px] mx-auto px-4 py-5 space-y-8">
            <Card className="overflow-hidden border-none shadow-xl">
                {/* Header skeleton */}
                <div className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-lg mr-3" />
                            <Skeleton className="h-8 w-48" />
                        </div>
                        <Skeleton className="h-10 w-32 sm:w-48" />
                    </div>
                    <Skeleton className="h-1 w-full mt-6" />
                </div>

                {/* Table header skeleton */}
                <div className="grid grid-cols-15 p-4 border-b rounded-t-md">
                    <Skeleton className="col-span-1 h-6 w-full" />
                    <Skeleton className="col-span-5 h-6 w-full ml-5" />
                    <Skeleton className="col-span-3 h-6 w-full mx-auto" />
                    <Skeleton className="col-span-3 h-6 w-full mx-auto" />
                    <Skeleton className="col-span-3 h-6 w-full mx-auto" />
                </div>

                {/* Table rows skeleton */}
                <div className="divide-y">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="grid grid-cols-15 p-4 items-center">
                            <div className="col-span-1 flex justify-center">
                                <Skeleton className="w-8 h-8 rounded-full" />
                            </div>
                            <div className="col-span-5 flex items-center gap-3">
                                <Skeleton className="h-6 w-32 ml-4" />
                            </div>
                            <div className="col-span-3 flex justify-center">
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <div className="col-span-3 flex justify-center">
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <div className="col-span-3 flex justify-center">
                                <Skeleton className="h-6 w-16" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination skeleton */}
                <div className="p-4 border-t flex justify-between items-center">
                    <Skeleton className="h-5 w-32 ml-8" />
                    <div className="flex items-center space-x-1">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton key={index} className="h-8 w-8 rounded-xl" />
                            ))}
                        </div>
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
            </Card>
        </div>
    )
}

