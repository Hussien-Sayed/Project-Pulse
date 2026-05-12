import sessionRepository from '../storage/sessionRepository.js';
import * as metricsCalculator from './metricsCalculator.js';
import * as timeUtils from '../utils/timeUtils.js';

/**
 * Service to compose analytics results for the UI.
 */
class ReportService {
    /**
     * Composes a detailed report for a single session
     * @param {string} sessionId 
     * @returns {Promise<Object>}
     */
    async getSessionReport(sessionId) {
        const session = sessionRepository.findById(sessionId);
        if (!session) return null;

        const metrics = metricsCalculator.calculateAll(session);
        return { session, metrics };
    }

    /**
     * Composes a summary of all sessions
     * @returns {Promise<Array>}
     */
    async getAllSessionsSummary() {
        const sessions = sessionRepository.findAll();
        
        return sessions.map(session => ({
            ...session,
            metrics: {
                idlePercentage: metricsCalculator.calculateIdlePercentage(session),
                activityRate: metricsCalculator.calculateActivityRate(session),
                productivityScore: metricsCalculator.calculateProductivityScore(session)
            }
        }));
    }

    /**
     * Groups sessions by week and then by day
     * @param {Array} sessions 
     * @returns {Object}
     */
    groupSessionsHierarchical(sessions) {
        const groups = {}; // Week -> Day -> Sessions
        
        sessions.forEach(session => {
            const date = new Date(session.created_at);
            
            // Get week number (simplified)
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            const weekKey = `Week ${weekNum}, ${date.getFullYear()}`;
            
            const dayKey = timeUtils.toDateString(session.created_at);
            
            if (!groups[weekKey]) groups[weekKey] = {};
            if (!groups[weekKey][dayKey]) groups[weekKey][dayKey] = [];
            
            groups[weekKey][dayKey].push(session);
        });
        
        return groups;
    }
}

const reportService = new ReportService();
export default reportService;
