/**
 * Philippine time (Asia/Manila, UTC+8) helpers.
 * Use these so "today" and day boundaries are correct regardless of server timezone.
 */

const PH_OFFSET_MS = 8 * 60 * 60 * 1000;

/**
 * Get the calendar date (YYYY-MM-DD) in Philippine time for a given moment.
 * @param {Date} date - Any moment (typically new Date())
 * @returns {string} - e.g. "2025-03-10"
 */
function getDateStringInPH(date) {
  const d = new Date(date.getTime() + PH_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Get start and end of day in Philippine time for a given moment or date string.
 * @param {Date|string} date - A Date (use that moment's PH day) or "YYYY-MM-DD"
 * @returns {{ start: Date, end: Date }}
 */
function getDayBoundsInPH(date) {
  const dateStr = typeof date === 'string' ? date : getDateStringInPH(date);
  return {
    start: new Date(dateStr + 'T00:00:00.000+08:00'),
    end: new Date(dateStr + 'T23:59:59.999+08:00'),
  };
}

module.exports = {
  getDateStringInPH,
  getDayBoundsInPH,
};
