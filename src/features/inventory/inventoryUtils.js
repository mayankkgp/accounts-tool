/**
 * Helper to parse inwardDate (format DD/MM/YYYY)
 */
export function parseDateDDMMYYYY(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

/**
 * Dynamic Age calculation (Current Date June 24, 2026 - Inward Date)
 */
export function calculateAge(inwardDateStr) {
  const inwardDate = parseDateDDMMYYYY(inwardDateStr);
  if (!onwardDateCheck(inwardDate)) return 0;

  let today = new Date();
  const anchorDate = new Date(2026, 5, 24); // June 24, 2026
  if (today < anchorDate) {
    today = anchorDate;
  }

  // Set times to midnight to avoid partial day calculations
  today.setHours(0, 0, 0, 0);
  inwardDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - inwardDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : 0;
}

function onwardDateCheck(dateObj) {
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}
