import axios from "axios";
import { ProfileUser } from "@/components/ProfilePage";

export const fetchPlatformsData = async (user: ProfileUser) => {
    try {
        if (user.leetCode?.username) {
            const url = `https://leetcode.com/graphql`;
            const query = {
                query: `query ($username: String!) {
                      matchedUser(username: $username) {
                          username
                          profile {
                          realName
                          ranking
                          starRating
                          }
                          submitStats: submitStatsGlobal {
                          acSubmissionNum {
                              difficulty
                              count
                              submissions
                          }
                          }
                      }
                      userContestRanking(username: $username) {
                          rating
                      }
                  }`,
                variables: { username: user.leetCode.username }
            };
            const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' };
            const response = await axios.post(url, query, { headers });

            if(!response.data.data.matchedUser) {
                throw new Error("User not found");
            }

            const rating = Math.floor(response.data.data?.userContestRanking?.rating || user.leetCode.rating || 0);
            const rank = Math.floor(response.data.data?.matchedUser?.profile?.ranking || user.leetCode.rank || 0);
            const stats = response.data.data?.matchedUser?.submitStats?.acSubmissionNum || [];
            const totalSolved = stats.find((stat: any) => stat.difficulty === "All")?.count || user.leetCode.solved || 0;

            user.leetCode = {
                rating: rating,
                rank: rank,
                solved: totalSolved
            };

            console.log("LeetCode data:", user.leetCode);
        }

        if (user.codeforces?.username) {
            const response = await axios.get(`https://codeforces.com/api/user.status?handle=${user.codeforces.username}`);
            const submissions = response.data.result;
            const userInfoResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${user.codeforces.username}`);
            const userInfo = userInfoResponse.data.result[0];

            let solvedProblems = new Set();
            submissions.forEach((submission: any) => {
                if (submission.problem && submission.problem.id) {
                    solvedProblems.add(submission.problem.id);
                }
            });

            const totalSolved = solvedProblems.size;
            user.codeforces = {
                rating: userInfo.rating || user.codeforces.rating || 0,
                rank: userInfo.rank || user.codeforces.rank || "",
                solved: totalSolved || user.codeforces.solved || 0
            };
            console.log("Codeforces data:", user.codeforces);
        }
        return user;
    } catch (error) {
        console.error("Error fetching platforms data:", error);
        throw error;
    }
};
