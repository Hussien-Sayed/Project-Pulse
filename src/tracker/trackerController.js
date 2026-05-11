import SessionManager from './sessionManager.js';
import ActivityMonitor from './activityMonitor.js';
import IdleDetector from './idleDetector.js';
import sessionRepository from '../storage/sessionRepository.js';
import eventBus from '../utils/eventBus.js';
import { TICK_INTERVAL_MS } from '../config/constants.js';

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
     */
    startSession(title) {
        if (this.sessionManager && this.sessionManager.status !== 'stopped') {
            throw new Error('A session is already in progress');
        }

        this.sessionManager = new SessionManager();
        this.sessionManager.createSession(title);

        this.activityMonitor.resetCounters();
        this.activityMonitor.startMonitoring();
        
        this.idleDetector.start();

        this._startTick();

        // Initial save to DB
        const sessionData = this.sessionManager.serializeSession();
        sessionRepository.create({
            id: sessionData.sessionId,
            title: sessionData.title,
            status: sessionData.status,
            start_time: sessionData.startTime,
            created_at: Date.now()
        });

        console.log(`Tracker: Started session "${title}"`);
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
        
        console.log('Tracker: Session paused');
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

        console.log('Tracker: Session resumed');
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
        console.log('Tracker: Session stopped');
        return finalSession;
    }

    /**
     * Returns the current state of the session
     * @returns {Object}
     */
    getCurrentSession() {
        if (!this.sessionManager) return null;

        const base = this.sessionManager.serializeSession();
        const activity = this.activityMonitor.getActivityMetrics();
        const idleMs = this.idleDetector.getIdleMs();

        return {
            ...base,
            ...activity,
            idleMs
        };
    }

    /**
     * Starts the periodic tick event for the UI
     */
    _startTick() {
        this._stopTick();
        this._tickInterval = setInterval(() => {
            const data = this.getCurrentSession();
            eventBus.emit('tracker:tick', data);
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

        sessionRepository.update(session.sessionId, {
            status: session.status,
            elapsed_ms: session.elapsedMs,
            idle_ms: session.idleMs,
            click_count: session.clickCount,
            keystroke_count: session.keystrokeCount,
            ...extraData
        });
    }
}

const trackerController = new TrackerController();
export default trackerController;
