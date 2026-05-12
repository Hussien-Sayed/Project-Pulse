import SessionManager from './sessionManager.js';
import ActivityMonitor from './activityMonitor.js';
import IdleDetector from './idleDetector.js';
import sessionRepository from '../storage/sessionRepository.js';
import eventBus from '../utils/eventBus.js';
import { TICK_INTERVAL_MS } from '../config/constants.js';
import { logIf, shouldLog } from '../config/logSettings.js';

/**
 * Central orchestrator for a tracking session lifecycle.
 * Wires together time tracking, activity monitoring, and persistence.
 */
class TrackerController {
    constructor() {
        this.sessionManager = null;
        this.activityMonitor = new ActivityMonitor();
        this.idleDetector = new IdleDetector();
        this._tickInterval = null;
    }

    /**
     * Starts a new tracking session
     * @param {string} title 
     * @param {string} project
     */
    startSession(title, project) {
        if (this.sessionManager && this.sessionManager.status !== 'stopped') {
            throw new Error('A session is already in progress');
        }

        this.sessionManager = new SessionManager();
        this.sessionManager.createSession(title, project);

        this.activityMonitor.resetCounters();
        this.activityMonitor.startMonitoring();
        
        this.idleDetector.start();

        this._startTick();

        // Initial save to DB
        const sessionData = this.sessionManager.serializeSession();
        sessionRepository.create({
            id: sessionData.sessionId,
            title: sessionData.title,
            project: sessionData.project,
            status: sessionData.status,
            start_time: sessionData.startTime,
            created_at: Date.now()
        });

        logIf('trackerController', 'start', `Tracker: Started session "${title}"`);
        return this.getCurrentSession();
    }

    /**
     * Pauses the active session
     */
    pauseSession() {
        if (!this.sessionManager || this.sessionManager.status !== 'running') return;

        this.sessionManager.pause();
        this.activityMonitor.stopMonitoring();
        this.idleDetector.stop();
        this._stopTick();

        // Update DB
        this._syncToDb();
        
        logIf('trackerController', 'start', 'Tracker: Session paused');
        return this.getCurrentSession();
    }

    /**
     * Resumes a paused session
     */
    resumeSession() {
        if (!this.sessionManager || this.sessionManager.status !== 'paused') return;

        this.sessionManager.resume();
        this.activityMonitor.startMonitoring();
        this.idleDetector.start();
        this._startTick();

        logIf('trackerController', 'start', 'Tracker: Session resumed');
        return this.getCurrentSession();
    }

    /**
     * Stops and finalizes the current session
     */
    stopSession() {
        if (!this.sessionManager || this.sessionManager.status === 'stopped') return;

        this.sessionManager.stop();
        this.activityMonitor.stopMonitoring();
        this.idleDetector.stop();
        this._stopTick();

        // Final sync and update DB
        this._syncToDb({ status: 'stopped', end_time: Date.now() });

        const finalSession = this.getCurrentSession();
        logIf('trackerController', 'start', 'Tracker: Session stopped');
        return finalSession;
    }

    /**
     * Returns the current state of the session
     * @returns {Object}
     */
    getCurrentSession() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        if (!this.sessionManager) {
            return {
                status: 'idle',
                elapsedMs: 0,
                dailyTotalMs: sessionRepository.getDailyTotalMs(),
                eventCount: 0,
                idleMs: 0
            };
        }

        const base = this.sessionManager.serializeSession();
        const activity = this.activityMonitor.getActivityMetrics();
        const idleMs = this.idleDetector.getIdleMs();

        const row = sessionRepository.db.prepare(`
            SELECT SUM(elapsed_ms) as total 
            FROM sessions 
            WHERE created_at >= ? AND id != ?
        `).get(startOfDay.getTime(), base.sessionId || '');
        
        const otherSessionsTodayMs = row ? (row.total || 0) : 0;
        const dailyTotalMs = otherSessionsTodayMs + base.elapsedMs;

        return {
            ...base,
            ...activity,
            idleMs,
            dailyTotalMs
        };
    }

    /**
     * Starts the periodic tick event for the UI
     */
    _startTick() {
        this._stopTick();
        let tickCount = 0;
        this._tickInterval = setInterval(() => {
            const data = this.getCurrentSession();
            eventBus.emit('tracker:tick', data);
            
            // Sync to DB every 30 seconds (30 * 1000ms / TICK_INTERVAL_MS)
            tickCount++;
            if (tickCount >= 30) {
                this._syncToDb();
                tickCount = 0;
            }
        }, TICK_INTERVAL_MS);
    }

    /**
     * Stops the tick interval
     */
    _stopTick() {
        if (this._tickInterval) {
            clearInterval(this._tickInterval);
            this._tickInterval = null;
        }
    }

    /**
     * Synchronizes current session state to the database
     * @param {Object} extraData 
     */
    _syncToDb(extraData = {}) {
        const session = this.getCurrentSession();
        if (!session) return;

        sessionRepository.update(session.id, {
            status: session.status,
            elapsed_ms: session.elapsedMs,
            idle_ms: session.idleMs,
            event_count: session.eventCount,
            ...extraData
        });
    }
}

const trackerController = new TrackerController();
export default trackerController;
