export const isPlatformDataStale = (userId: string, thresholdMinutes = 30): boolean => {
    const key = `platformUpdateTimestamp_${userId}`;
    const lastUpdated = localStorage.getItem(key);
    if (!lastUpdated) return true;
    const diff = (Date.now() - parseInt(lastUpdated, 10)) / (60 * 1000);
    return diff > thresholdMinutes;
};

export const updatePlatformCacheTimestamp = (userId: string) => {
    const key = `platformUpdateTimestamp_${userId}`;
    localStorage.setItem(key, Date.now().toString());
    console.log(`Updated platform cache timestamp for user: ${userId}`);
};
