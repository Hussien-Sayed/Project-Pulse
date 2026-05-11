/**
 * Time calculation and formatting helpers
 */

/**
 * Formats milliseconds into HH:MM:SS string
 * @param {number} ms 
 * @returns {string}
 */
export function formatDuration(ms) {
    if (typeof ms !== 'number' || ms < 0) return '00:00:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Returns current timestamp in milliseconds
 * @returns {number}
 */
export function getCurrentTimestamp() {
    return Date.now();
}

/**
 * Calculates difference between two timestamps in milliseconds
 * @param {number} start 
 * @param {number} end 
 * @returns {number}
 */
export function calculateDifference(start, end) {
    return end - start;
}

/**
 * Formats a timestamp into YYYY-MM-DD string
 * @param {number|Date} timestamp 
 * @returns {string}
 */
export function toDateString(timestamp) {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '0000-00-00';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
