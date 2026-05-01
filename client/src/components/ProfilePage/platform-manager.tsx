"use client"
import { PlatformVerification } from "./platform-verification"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"

interface PlatformData {
  username?: string
  solved?: number
  rank?: number | string
  rating?: number
}

interface UserPlatforms {
  leetCode?: PlatformData
  // codechef?: PlatformData
  codeforces?: PlatformData
  // gfg?: PlatformData
}

interface PlatformManagerProps {
  userPlatforms: UserPlatforms
  onVerifyPlatform: (platform: string, username: string) => Promise<boolean>
}

export function PlatformManager({ userPlatforms, onVerifyPlatform }: PlatformManagerProps) {
  const platforms = [
    {
      type: "leetCode",
      isLinked: !!userPlatforms.leetCode?.username,
      username: userPlatforms.leetCode?.username,
      stats: userPlatforms.leetCode,
    },
    // {
    //   type: "gfg",
    //   isLinked: !!userPlatforms.gfg?.username,
    //   username: userPlatforms.gfg?.username,
    //   stats: userPlatforms.gfg,
    // },
    {
      type: "codeforces",
      isLinked: !!userPlatforms.codeforces?.username,
      username: userPlatforms.codeforces?.username,
      stats: userPlatforms.codeforces,
    },
    // {
    //   type: "codechef",
    //   isLinked: !!userPlatforms.codechef?.username,
    //   username: userPlatforms.codechef?.username,
    //   stats: userPlatforms.codechef,
    // },
  ]

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center text-lg">
          <Github className="mr-2 h-5 w-5 text-gray-500" /> Coding Platforms
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {platforms.map((platform) => (
          <PlatformVerification
            key={platform.type}
            platformType={platform.type}
            isLinked={platform.isLinked}
            username={platform.username}
            stats={platform.stats}
            onVerify={onVerifyPlatform}
          />
        ))}
      </CardContent>
    </Card>
  )
}

