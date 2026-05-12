import eventBus from '../utils/eventBus.js';
import { logIf, warnIf, errorIf, shouldLog } from '../config/logSettings.js';

/**
 * Simplified Activity Monitor - counts events only (no classification)
 * Uses Electron's powerMonitor to detect system activity
 * Emits 'activity' events to eventBus to reset idle timers.
 */
export default class ActivityMonitor {
    constructor() {
        this.eventCount = 0;
        this._isMonitoring = false;
        this._lastActivityTime = Date.now();
        this._lastIdleTime = null;
        this._powerMonitor = null;
        this._pollInterval = null;
        this._electron = null;
    }

    /**
     * Starts monitoring system-level input events
     */
    async startMonitoring() {
        if (this._isMonitoring) return;
        this._isMonitoring = true;

        try {
            // Import Electron modules
            this._electron = (await import('electron')).default;
            this._powerMonitor = this._electron.powerMonitor;

            // Start system monitoring
            this._startSystemMonitoring();

            logIf('activityMonitor', 'general', 'ActivityMonitor: Started system-wide monitoring');
        } catch (error) {
            errorIf('activityMonitor', 'general', 'ActivityMonitor: Failed to start monitoring:', error);
            this._isMonitoring = false;
        }
    }

    /**
     * Starts the core system monitoring loop
     */
    _startSystemMonitoring() {
        this._pollInterval = setInterval(() => {
            this._checkSystemActivity();
        }, 500); // Check every 500ms for responsiveness
    }

    /**
     * Checks system activity and counts events
     */
    _checkSystemActivity() {
        try {
            // Check if powerMonitor is available
            if (!this._powerMonitor) {
                warnIf('activityMonitor', 'general', 'ActivityMonitor: powerMonitor not available, skipping system activity check');
                return;
            }
            
            const idleTime = this._powerMonitor.getSystemIdleTime();
            const currentTime = Date.now();
            
            // Debug logging
            logIf('activityMonitor', 'debug', `🔍 DEBUG: idleTime=${idleTime}s, lastIdleTime=${this._lastIdleTime}s, timeSinceLastActivity=${currentTime - this._lastActivityTime}ms`);
            
            // System was idle and now active
            if (idleTime < 1 && (currentTime - this._lastActivityTime) > 1000) {
                this._onActivity(currentTime);
            }
            // Rapid idle time changes indicate activity
            else if (this._lastIdleTime !== undefined && this._lastIdleTime > idleTime) {
                this._onActivity(currentTime);
            }
            
            this._lastIdleTime = idleTime;
        } catch (error) {
            warnIf('activityMonitor', 'general', 'ActivityMonitor: Error checking system activity:', error.message);
        }
    }

    /**
     * Handles detected activity
     */
    _onActivity(currentTime) {
        // Debounce rapid events
        if (currentTime - this._lastActivityTime < 100) {
            return;
        }

        this._lastActivityTime = currentTime;
        this.eventCount++;

        eventBus.emit('activity', currentTime);
        logIf('activityMonitor', 'detection', `ActivityMonitor: Event detected - Total: ${this.eventCount}`);
    }

    /**
     * Stops monitoring
     */
    stopMonitoring() {
        this._isMonitoring = false;
        
        if (this._pollInterval) {
            clearInterval(this._pollInterval);
            this._pollInterval = null;
        }

        logIf('activityMonitor', 'general', 'ActivityMonitor: Stopped monitoring');
    }

    /**
     * Resets internal counters
     */
    resetCounters() {
        this.eventCount = 0;
    }

    /**
     * Returns current metrics
     */
    getActivityMetrics() {
        return {
            eventCount: this.eventCount
        };
    }
}
