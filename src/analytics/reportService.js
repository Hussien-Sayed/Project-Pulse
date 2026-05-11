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
     * Groups a session array by YYYY-MM-DD date key
     * @param {Array} sessions 
     * @returns {Object}
     */
    groupSessionsByDate(sessions) {
        return sessions.reduce((groups, session) => {
            const dateKey = timeUtils.toDateString(session.created_at);
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(session);
            return groups;
        }, {});
    }
}

const reportService = new ReportService();
export default reportService;
