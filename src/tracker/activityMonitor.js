import eventBus from '../utils/eventBus.js';

/**
 * Tracks user input events (mouse clicks, keystrokes) during a session.
 * Emits 'activity' events to the eventBus to reset idle timers.
 */
export default class ActivityMonitor {
    constructor() {
        this.clickCount = 0;
        this.keystrokeCount = 0;
        this._isMonitoring = false;
        
        // In a real Electron environment, we would use a native module here.
        // For this implementation, we provide methods to register events.
    }

    /**
     * Starts monitoring system-level input events
     */
    startMonitoring() {
        if (this._isMonitoring) return;
        this._isMonitoring = true;
        
        // TODO: Initialize native listeners (e.g., uiohook-napi)
        // For now, we assume the main process relays events to these methods
        console.log('ActivityMonitor: Started monitoring');
    }

    /**
     * Stops monitoring
     */
    stopMonitoring() {
        this._isMonitoring = false;
        // TODO: Remove native listeners
        console.log('ActivityMonitor: Stopped monitoring');
    }

    /**
     * Records a mouse click event
     */
    recordClick() {
        if (!this._isMonitoring) return;
        this.clickCount++;
        eventBus.emit('activity', Date.now());
    }

    /**
     * Records a keystroke event
     */
    recordKeystroke() {
        if (!this._isMonitoring) return;
        this.keystrokeCount++;
        eventBus.emit('activity', Date.now());
    }

    /**
     * Resets internal counters
     */
    resetCounters() {
        this.clickCount = 0;
        this.keystrokeCount = 0;
    }

    /**
     * Returns current metrics
     * @returns {Object}
     */
    getActivityMetrics() {
        return {
            clickCount: this.clickCount,
            keystrokeCount: this.keystrokeCount
        };
    }
}
