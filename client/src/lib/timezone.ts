/**
 * Client-side timezone utility for consistent IST (Indian Standard Time) handling
 * All business logic uses IST dates, database stores UTC
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30

/**
 * Get current date/time in IST
 */
export const getISTNow = () => {
  return new Date(Date.now() + IST_OFFSET_MS);
};

/**
 * Convert UTC date to IST date
 */
export const utcToIST = (utcDate: Date) => {
  if (!utcDate) return null;
  return new Date(utcDate.getTime() + IST_OFFSET_MS);
};

/**
 * Convert IST date to UTC date
 */
export const istToUTC = (istDate: Date) => {
  if (!istDate) return null;
  return new Date(istDate.getTime() - IST_OFFSET_MS);
};

/**
 * Get IST date boundaries for a given date (defaults to today)
 * Returns UTC dates that correspond to IST day boundaries
 */
export const getISTDateBounds = (date: Date | null = null) => {
  const referenceDate = date || getISTNow();

  // Create IST date boundaries
  const istDate = new Date(referenceDate);
  istDate.setHours(0, 0, 0, 0);

  const istTomorrow = new Date(istDate);
  istTomorrow.setDate(istTomorrow.getDate() + 1);

  // Convert back to UTC for database queries
  return {
    start: istToUTC(istDate),
    end: istToUTC(istTomorrow)
  };
};

/**
 * Format date to IST date string (YYYY-MM-DD)
 */
export const formatISTDateString = (date: Date | null = null) => {
  const istDate = date ? utcToIST(date) : getISTNow();
  if (!istDate) return '';
  return istDate.toISOString().split('T')[0];
};

/**
 * Check if date is in the past compared to current IST date
 */
export const isPastDateIST = (date: Date) => {
  const todayIST = getISTNow();
  const dateIST = utcToIST(date);

  if (!dateIST) return false;

  // Compare dates by setting both to start of day
  const todayStart = new Date(todayIST);
  todayStart.setHours(0, 0, 0, 0);

  const dateStart = new Date(dateIST);
  dateStart.setHours(0, 0, 0, 0);

  return dateStart < todayStart;
};