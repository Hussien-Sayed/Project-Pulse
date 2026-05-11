import eventBus from '../utils/eventBus.js';
import { IDLE_THRESHOLD_MS } from '../config/constants.js';

/**
 * Detects inactivity and accumulates total idle time.
 * Listens to 'activity' events from the eventBus.
 */
export default class IdleDetector {
    constructor(thresholdMs = IDLE_THRESHOLD_MS) {
        this.idleThresholdMs = thresholdMs;
        this.lastActivityAt = Date.now();
        this.totalIdleMs = 0;
        this._isIdle = false;
        this._checkInterval = null;
        this._unsubActivity = null;
    }

    /**
     * Starts the idle detection cycle
     */
    start() {
        this.lastActivityAt = Date.now();
        this._unsubActivity = eventBus.on('activity', (timestamp) => this.updateActivity(timestamp));
        
        // Poll for idleness every 5 seconds
        this._checkInterval = setInterval(() => this._checkIdle(), 5000);
    }

    /**
     * Stops the idle detection cycle
     */
    stop() {
        if (this._checkInterval) {
            clearInterval(this._checkInterval);
            this._checkInterval = null;
        }

        if (this._unsubActivity) {
            this._unsubActivity();
            this._unsubActivity = null;
        }

        if (this._isIdle) {
            this._finalizeIdlePeriod();
        }
    }

    /**
     * Resets the idle timer on activity
     * @param {number} timestamp 
     */
    updateActivity(timestamp = Date.now()) {
        if (this._isIdle) {
            this._finalizeIdlePeriod();
            this._isIdle = false;
            eventBus.emit('idle:end', { timestamp, duration: this.lastIdleDuration });
        }
        this.lastActivityAt = timestamp;
    }

    /**
     * Checks if current inactivity exceeds threshold
     */
    _checkIdle() {
        const now = Date.now();
        const inactiveDuration = now - this.lastActivityAt;

        if (inactiveDuration >= this.idleThresholdMs && !this._isIdle) {
            this._isIdle = true;
            eventBus.emit('idle:start', { timestamp: now });
        }
    }

    /**
     * Adds the current idle period to the total
     */
    _finalizeIdlePeriod() {
        const now = Date.now();
        const idlePeriod = now - (this.lastActivityAt + this.idleThresholdMs);
        // Note: we only count time AFTER the threshold is reached as 'idle'
        // OR we count the whole inactivity duration. The spec says "accumulate total idle time".
        // Usually, idle time starts from the last activity.
        const duration = now - this.lastActivityAt;
        this.totalIdleMs += duration;
        this.lastIdleDuration = duration;
    }

    /**
     * Returns whether currently idle
     * @returns {boolean}
     */
    isIdle() {
        return this._isIdle;
    }

    /**
     * Returns total accumulated idle time in ms
     * @returns {number}
     */
    getIdleMs() {
        if (this._isIdle) {
            return this.totalIdleMs + (Date.now() - this.lastActivityAt);
        }
        return this.totalIdleMs;
    }
}
