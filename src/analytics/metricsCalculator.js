/**
 * Pure functions to compute productivity metrics from session data.
 */

/**
 * Calculates events per minute
 * @param {Object} session 
 * @returns {number}
 */
export function calculateActivityRate(session) {
    const { click_count = 0, keystroke_count = 0, elapsed_ms = 0 } = session;
    if (elapsed_ms === 0) return 0;
    
    const totalEvents = click_count + keystroke_count;
    const elapsedMinutes = elapsed_ms / 60000;
    
    return totalEvents / elapsedMinutes;
}

/**
 * Calculates percentage of idle time
 * @param {Object} session 
 * @returns {number}
 */
export function calculateIdlePercentage(session) {
    const { idle_ms = 0, elapsed_ms = 0 } = session;
    if (elapsed_ms === 0) return 0;
    
    return (idle_ms / elapsed_ms) * 100;
}

/**
 * Calculates a productivity score from 0 to 100
 * @param {Object} session 
 * @returns {number}
 */
export function calculateProductivityScore(session) {
    const idlePercentage = calculateIdlePercentage(session);
    const activityRate = calculateActivityRate(session);

    // Weighted formula: 
    // - Start with 100
    // - Subtract idle percentage (0-100)
    // - Add activity bonus (activityRate * factor, e.g., 2)
    // - Clamp between 0 and 100
    
    const activityBonus = activityRate * 2; // Arbitrary factor
    const score = 100 - idlePercentage + activityBonus;

    return Math.min(100, Math.max(0, score));
}

/**
 * Returns all metrics for a session
 * @param {Object} session 
 * @returns {Object}
 */
export function calculateAll(session) {
    return {
        activityRate: calculateActivityRate(session),
        idlePercentage: calculateIdlePercentage(session),
        productivityScore: calculateProductivityScore(session)
    };
}
