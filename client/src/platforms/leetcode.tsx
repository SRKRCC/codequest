import axios from "axios";
 
 export const fetchCodeforcesProfile = async (username: string) => {
   try {
     const response = await axios.get(`https://codeforces.com/api/user.status?handle=${username}`);
     const submissions= response.data;
    //  console.log(submissions)
     return submissions;
    //  return mockdata;
   } catch (error) {
     console.error('Error fetching user data:', error);
   }
 };

 export const fetchLeetCodeProfile = async (username: string) => {
  try {
    console.log("username",username);
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/platforms/leetcode/graphql`, { username });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching LeetCode data:', error);
    return null;
  }
 };

