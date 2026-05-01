import axios from 'axios';

export const postPotdChallenge = async (username:string,challengeId : string , difficulty : string) => {
  try {
    const now = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    
    let year = "", month = "", day = "", hour = "", minute = "", second = "";
    
    now.forEach(part => {
      if (part.type === "year") year = part.value;
      if (part.type === "month") month = part.value;
      if (part.type === "day") day = part.value;
      if (part.type === "hour") hour = part.value;
      if (part.type === "minute") minute = part.value;
      if (part.type === "second") second = part.value;
    });
    
    const today = {
      date: `${year}-${month}-${day}`,
      time: `${hour}:${minute}:${second}`
    };
    
    console.log("today", today);
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/profile/potd`, {
      username,
      challengeId,
      difficulty,
      timestamp: today
    }, {
      withCredentials: true 
    });
    console.log("posted potd challenge");
    return response.data;
  } catch (error) {
    console.error('Error posting POTD challenge:', error);
    return null;
  }
};


export const solvedChallenges = async (username:string) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/platforms/solvedChallenges`, {
      username: username,
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching solved challenges:', error);
    return null;
  }
}
export const streak = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/profile/streak`, {
      withCredentials: true
    });
    if (response.data.success) {
      return response.data;
    } else {
      console.error('Streak update failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching streak:', error);
    return null;
  }
}
