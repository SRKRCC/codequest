import fetch from "node-fetch";
import axios from "axios";
import { User } from "../models/User.js";
import { fetchCodeforcesProfile, fetchLeetCodeProfile } from "../lib/leetcode.js";
import { Challenge } from "../models/Challenge.js";
import { getGFGName } from "../utils/gfgService.js";
import auditService from "../services/auditService.js";
import { formatISTDateString, isWithinTodayIST } from '../utils/timezone.js';
export const leetcodeData = async (req, res) => {
  try {
    const username = req.body.username;
    const user = await User.findOne({ 'leetCode.username': username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
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
        variables: { username }
    };
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' };
    const response = await axios.post(url, query, { headers});

    if (!response.data.data.matchedUser) {
        return res.status(400).json({ error: 'Invalid LeetCode username' });
    }
    const responseData = response.data.data;
    const rating = Math.floor(responseData?.userContestRanking?.rating) || user.leetCode.rating || 0;
    const rank = responseData?.matchedUser?.profile?.ranking || user.leetCode.rank || 0;
    const stats = responseData?.matchedUser?.submitStats?.acSubmissionNum || [];
    const totalSolved = stats.find(s => s.difficulty === "All")?.count || user.leetCode.solved || 0;
    // Check if data actually changed before updating
    const hasChanged = 
      user.leetCode.rating !== rating || 
      user.leetCode.rank !== rank || 
      user.leetCode.solved !== totalSolved;

    if (!hasChanged) {
      return res.json({ 
        success: true, 
        message: "LeetCode data is already up to date",
        modified: false
      });
    }

    const updateResult = await User.updateOne(
      { _id: user._id }, 
      { 
        $set: { 
          'leetCode.username': username, 
          'leetCode.rating': rating, 
          'leetCode.rank': rank, 
          'leetCode.solved': totalSolved,
        } 
      }
    );

    return res.json({ 
      success: true, 
      message: "LeetCode data updated successfully",
      modified: updateResult.modifiedCount > 0
    });
  } catch (error) {
    return res.status(500).json({ error: `Failed to fetch data` });
  }
};

export const geeksforgeeksData = async (req, res) => {
  try {
    const username = req.body.username; // Get username from request body
    const user = await User.findOne({ 'gfg.username': username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const response = await getGFGName(username);
    if (response.error) {
      // console.error(`Error fetching GFG data for user ${username}: ${response.error}`);
    }
    const totalSolved = response.total_problems_solved;
    const instituteRank = response.institute_rank || 0;
    const rating = response.rating || 0;

    const hasChanged = 
      user.gfg.solved !== totalSolved || 
      user.gfg.rank !== instituteRank || 
      user.gfg.rating !== rating;

    if (!hasChanged) {
      return res.json({ 
        success: true, 
        message: "GFG data is already up to date",
        modified: false
      });
    }

    const updateResult = await User.updateOne(
      { _id: user._id },
      {
        $set: {
          'gfg.username': username,
          'gfg.solved': totalSolved,
          'gfg.rank': instituteRank,
          'gfg.rating': rating,
        }
      }
    );

    return res.json({ 
      success: true, 
      message: "GFG data updated successfully",
      modified: updateResult.modifiedCount > 0
    });
  } catch (error) {
    // console.error("GFG API Error:", error.message);
    return res.status(500).json({ error: `Failed to fetch data` });
  }
};

export const codeforcesData = async (req, res) => {
  try {
    const username = req.body.username; // Get username from request body
    const user = await User.findOne({ 'codeforces.username': username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const response = await axios.get(`https://codeforces.com/api/user.status?handle=${username}`);
    const submissions = response.data.result;
    const userInfoResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
    const userInfo = userInfoResponse.data.result[0];

    let solvedProblems = new Set();
    submissions.forEach((submission) => {
      if (submission.verdict === "OK") {
        let problemId = `${submission.problem.contestId}-${submission.problem.index}`;
        solvedProblems.add(problemId);
      }
    });

    const totalSolved = solvedProblems.size;

    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          'codeforces.solved': totalSolved,
          'codeforces.rating': userInfo.rating || 0,
          'codeforces.rank': userInfo.rank || "",
        }
      }
    );

    return res.json({ success: true, message: "Codeforces data updated successfully" });
  } catch (error) {
    // console.error("Codeforces API Error:", error.message);
    return res.status(500).json({ error: `Failed to fetch data` });
  }
};

export const codechefData = async (req, res) => {
  try {
    const username = req.body.username; // Get username from request body
    const user = await User.findOne({ 'codechef.username': username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const response = await axios.get(`https://codechef-api.vercel.app/handle/${username}`);
    const { currentRating, globalRank, stars } = response.data;

    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          'codechef.rating': currentRating,
          'codechef.rank': globalRank,
          'codechef.stars': stars
        }
      }
    );

    return res.json({ success: true, message: "Codechef data updated successfully" });
  } catch (error) {
    // console.error("Codechef API Error:", error.message);
    return res.status(500).json({ error: `Failed to fetch data` });
  }
};

export const solvedChallenges = async (req, res) => {
  try {
    const username = req.body.username;
    const user = await User.findOne({ 'username': username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch Leetcode data
    const leetcoderesponse = await fetchLeetCodeProfile(user.leetCode.username);
    
    const leetcodeChallenges = leetcoderesponse.recentSubmissionList.map(submission => ({
      title: submission.title,
      timestamp: submission.timestamp,
      status: submission.statusDisplay
    }));

    const challenges = await Challenge.find();

    // // Find common challenges between fetched data and database
    const commonChallenges = challenges.filter(challenge =>
      leetcodeChallenges.some(lc => lc.title.toLowerCase() === challenge.title.toLowerCase())
    );

    // // Create purified_one object for Leetcode
    const purified_one = leetcodeChallenges.filter(lc =>
      commonChallenges.some(challenge => challenge.title.toLowerCase() === lc.title.toLowerCase())
    );

    // // Update heatmap for Leetcode
    // Normalize all existing timestamps to string and store in a Set
    const existingTimestamps = new Set(user.heatmap.map(entry => Number(entry.timestamp)));

    const newHeatmapEntries = purified_one.reduce((acc, lc) => {
      const ts = Number(lc.timestamp);
      if (!existingTimestamps.has(ts)) {
        existingTimestamps.add(ts);
        acc.push({ timestamp: ts });
      }
      return acc;
    }, []);

    user.heatmap.push(...newHeatmapEntries);


    // Safely append only new, non-duplicate entries
    user.heatmap.push(...newHeatmapEntries);



    // // Update solved challenges for Leetcode
    for (const lc of purified_one) {
      if (lc.status === "Accepted") {
        const challenge = commonChallenges.find(ch => ch.title.toLowerCase() === lc.title.toLowerCase());
        const challengeExists = user.solveChallenges.some(solvedChallenge => solvedChallenge.challengeId.equals(challenge._id));
        if (!challengeExists) {
          await User.findByIdAndUpdate(
            user._id,
            {
              $addToSet: {
                'solveChallenges': {
                  challengeId: challenge._id,
                  timestamp: lc.timestamp
                }
              }
            }
          );
        } else {
          auditService.challengeEvent('challenge_already_solved', {
            userId: user._id.toString(),
            challengeId: challenge._id.toString(),
            platform: challenge.platform
          });
        }
      }
    }


    // Points calculation for Leetcode
    // const solvedChallenges = user.solveChallenges.map(solve => solve.challengeId);
    // const solvedProblemsleetcode = await Challenge.find({ _id: { $in: solvedChallenges } }).populate('difficulty');
    // let easy = 0, medium = 0, hard = 0;
    // for (const problem of solvedProblemsleetcode) {
    //   if (problem.difficulty === "Easy") {
    //     easy++;
    //   } else if (problem.difficulty === "Medium") {
    //     medium++;
    //   } else if (problem.difficulty === "Hard") {
    //     hard++;
    //   }
    // }

    // const points = easy * 5 + medium * 10 + hard * 20;
    // await User.findByIdAndUpdate(
    //   user._id,
    //   {
    //     $set: {
    //       'points': points
    //     }
    //   }
    // );
    await user.save();
    res.json({ success: true, message: "Data Added Successfully" });
  } catch (error) {
    // console.error("Error fetching data:", error);
    res.status(500).json({ error: `Failed to fetch data` });
  }
}


export const fetchLeetCodeStatus = async (username, challengeTitle) => {
  const query = `
    {
      matchedUser(username: "${username}") {
        username
      }
      recentSubmissionList(username: "${username}", limit: 20) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
    }
  `;
  try {
    const response = await axios.post('https://leetcode.com/graphql', { query });
    const { matchedUser, recentSubmissionList } = response.data.data;
    
    if (!matchedUser) {
      throw new Error("Invalid LeetCode username");
    }

    if (!recentSubmissionList || recentSubmissionList.length === 0) {
      throw new Error("No submissions found");
    }

    const today = formatISTDateString();

    const solvedToday = recentSubmissionList.some(submission => {
      const submissionDate = formatISTDateString(new Date(parseInt(submission.timestamp) * 1000));
      return submission.title === challengeTitle && submission.statusDisplay === "Accepted" && submissionDate === today;
    });

    if (solvedToday) {
      return { success: true, message: "Challenge solved today" };
    } else {
      return { success: false, message: "Challenge not solved today" };
    }

  } catch (error) {
    // console.error('Error fetching user data from LeetCode:', error);
    return { success: false, message: "Failed to fetch LeetCode data" };
  }
};

export const fetchCodeforcesStatus = async (username, challengeTitle) => {
  try {
    const response = await axios.get(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=20`);
    const submissions = response.data;

    if (!submissions || !submissions.result) {
      return { success: false, message: "Invalid Codeforces username or no submissions found" };
    }

    const today = formatISTDateString();

    const solvedProblem = submissions.result.find((submission) => {
      const submissionDate = formatISTDateString(new Date(submission.creationTimeSeconds * 1000));
      return submission.problem.name === challengeTitle && submission.verdict === "OK" && submissionDate === today;
    });

    if (solvedProblem) {
      return { success: true, message: "Challenge solved today" };
    } else {
      return { success: false, message: "Challenge not solved today" };
    }

  } catch (error) {
    auditService.error('Failed to fetch Codeforces user data', error, {
      username,
      platform: 'codeforces'
    });
    return { success: false, message: "Failed to fetch Codeforces data" };
  }
}

export const heatmap = async (req, res) => {
  try {
    const username = req.body.username;
    const user = await User.findOne({ 'username': username });
    // console.log(user.heatmap, "heatmap");
    // console.log(solvedChallenges , "solvedChallenges");
    return res.status(200).json({ message: "Heatmap fetched successfully", heatmap: user.heatmap });
  } catch (error) {
    auditService.error('Failed to fetch heatmap', error, {
      requestId: req.auditContext?.requestId,
      userId: req.user?._id?.toString()
    });
    res.status(500).json({ error: 'Failed to fetch heatmap' });
  }
}

