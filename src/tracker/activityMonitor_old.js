import eventBus from '../utils/eventBus.js';

/**
 * Tracks user input events (mouse clicks, keystrokes) during a session.
 * Uses Electron's native capabilities for system-wide activity monitoring.
 * Emits 'activity' events to the eventBus to reset idle timers.
 */
export default class ActivityMonitor {
    constructor() {
        this.clickCount = 0;
        this.keystrokeCount = 0;
        this._isMonitoring = false;
        this._lastActivityTime = Date.now();
        this._lastKeyboardTime = 0;
        this._lastMouseTime = 0;
        this._powerMonitor = null;
        this._globalShortcut = null;
        this._pollInterval = null;
        this._activityCheckInterval = null;
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
            this._globalShortcut = this._electron.globalShortcut;

            // Set up global shortcuts for activity detection
            this._setupGlobalShortcuts();

            // Enhanced system monitoring
            this._setupSystemMonitoring();

            console.log('ActivityMonitor: Started system-wide monitoring');
        } catch (error) {
            console.error('ActivityMonitor: Failed to start monitoring:', error);
            // Fallback to basic monitoring
            this._setupBasicMonitoring();
        }
    }

    /**
     * Sets up global shortcuts for activity detection
     */
    _setupGlobalShortcuts() {
        // Register multiple common key combinations to capture keyboard activity
        // This is a limitation of Electron's globalShortcut - it can only capture specific combinations
        const keyboardShortcuts = [
            'CommandOrControl+Shift+K',
            'CommandOrControl+Shift+A',
            'CommandOrControl+Shift+S',
            'CommandOrControl+Shift+D',
            'CommandOrControl+Shift+F',
            'Alt+Shift+K',
            'Alt+Shift+A'
        ];

        keyboardShortcuts.forEach((shortcut) => {
            try {
                const ret = this._globalShortcut.register(shortcut, () => {
                    console.log(`ActivityMonitor: Global shortcut triggered: ${shortcut}`);
                    this._onSystemActivity('keyboard');
                });
                
                if (!ret) {
                    console.warn(`ActivityMonitor: Failed to register shortcut ${shortcut}`);
                } else {
                    console.log(`ActivityMonitor: Successfully registered shortcut: ${shortcut}`);
                }
            } catch (error) {
                console.warn(`ActivityMonitor: Error registering shortcut ${shortcut}:`, error.message);
            }
        });

        console.log(`ActivityMonitor: Registered ${keyboardShortcuts.length} keyboard detection shortcuts`);
    }

    /**
     * Sets up enhanced system monitoring
     */
    _setupSystemMonitoring() {
        // Monitor system idle time more frequently
        this._pollInterval = setInterval(() => {
            this._checkSystemActivity();
        }, 500); // Check every 500ms for better responsiveness

        // Additional activity detection using window focus
        if (this._electron.app && this._electron.app.on) {
            this._electron.app.on('browser-window-focus', () => {
                this._onSystemActivity('window-focus');
            });
        }
    }

    /**
     * Checks system activity using multiple methods
     */
    _checkSystemActivity() {
        try {
            const idleTime = this._powerMonitor.getSystemIdleTime();
            const currentTime = Date.now();
            
            // If system was idle and now active, count as activity
            if (idleTime < 1 && (currentTime - this._lastActivityTime) > 1000) {
                const activityType = this._classifySystemActivity(currentTime);
                console.log(`ActivityMonitor: System reactivation classified as ${activityType}`);
                this._onSystemActivity(activityType);
            }
            
            // Detect rapid changes in idle time (indicating user activity)
            if (this._lastIdleTime !== undefined && this._lastIdleTime > idleTime) {
                const activityType = this._classifyIdleChange(currentTime);
                console.log(`ActivityMonitor: Idle time change from ${this._lastIdleTime} to ${idleTime} classified as ${activityType}`);
                this._onSystemActivity(activityType);
            }
            
            this._lastIdleTime = idleTime;
        } catch (error) {
            console.warn('ActivityMonitor: Error checking system activity:', error.message);
        }
    }

    /**
     * Classifies system activity based on timing patterns and heuristics
     */
    _classifySystemActivity(currentTime) {
        const timeSinceLastKeyboard = currentTime - (this._lastKeyboardTime || 0);
        const timeSinceLastMouse = currentTime - (this._lastMouseTime || 0);
        const timeSinceLastActivity = currentTime - this._lastActivityTime;
        
        console.log(`ActivityMonitor: Classification - Time since keyboard: ${timeSinceLastKeyboard}ms, Time since mouse: ${timeSinceLastMouse}ms, Gap since last activity: ${timeSinceLastActivity}ms`);
        
        // Heuristic 1: If we recently had keyboard activity, likely more typing
        if (timeSinceLastKeyboard < 2000) {
            return 'keyboard';
        }
        
        // Heuristic 2: If activity gap is very short (<500ms), likely rapid typing
        if (timeSinceLastActivity < 500 && timeSinceLastKeyboard < 5000) {
            return 'keyboard';
        }
        
        // Heuristic 3: If activity gap is longer (>2s), more likely mouse click
        if (timeSinceLastActivity > 2000) {
            return 'mouse';
        }
        
        // Heuristic 4: Time of day - keyboard activity more common during work hours
        const hour = new Date().getHours();
        if (hour >= 9 && hour <= 17 && timeSinceLastKeyboard < 10000) {
            return 'keyboard';
        }
        
        // Default: slight preference to keyboard for balanced counting
        return Math.random() > 0.4 ? 'keyboard' : 'mouse';
    }

    /**
     * Classifies idle time changes based on patterns
     */
    _classifyIdleChange(currentTime) {
        const timeSinceLastKeyboard = currentTime - (this._lastKeyboardTime || 0);
        
        // If recent keyboard activity, likely more typing
        if (timeSinceLastKeyboard < 3000) {
            return 'keyboard';
        }
        
        // Idle changes are more commonly caused by mouse movements/clicks
        return 'mouse';
    }

    /**
     * Handles detected system activity
     */
    _onSystemActivity(source) {
        const currentTime = Date.now();
        
        // Debounce rapid activity events
        if (currentTime - this._lastActivityTime < 100) {
            return;
        }

        this._lastActivityTime = currentTime;
        
        // Track timing for heuristics
        if (source === 'keyboard') {
            this._lastKeyboardTime = currentTime;
            this.keystrokeCount++;
        } else if (source === 'mouse' || source === 'window-focus' || source === 'idle-change') {
            this._lastMouseTime = currentTime;
            this.clickCount++;
        } else if (source === 'system-active') {
            // This should not be reached anymore, but handle for safety
            this.clickCount++;
        } else {
            // Default to counting as both for unknown sources
            this.keystrokeCount++;
            this.clickCount++;
        }

        eventBus.emit('activity', currentTime);
        
        console.log(`ActivityMonitor: Activity detected (${source}) - Keys: ${this.keystrokeCount}, Clicks: ${this.clickCount}`);
    }

    /**
     * Fallback basic monitoring
     */
    _setupBasicMonitoring() {
        this._pollInterval = setInterval(() => {
            const idleTime = this._powerMonitor.getSystemIdleTime();
            if (idleTime === 0) {
                eventBus.emit('activity', Date.now());
            }
        }, 1000);

        console.log('ActivityMonitor: Started basic monitoring (fallback)');
    }

    /**
     * Stops monitoring
     */
    stopMonitoring() {
        this._isMonitoring = false;
        
        // Clear all intervals
        if (this._pollInterval) {
            clearInterval(this._pollInterval);
            this._pollInterval = null;
        }
        
        if (this._activityCheckInterval) {
            clearInterval(this._activityCheckInterval);
            this._activityCheckInterval = null;
        }

        // Unregister global shortcuts
        if (this._globalShortcut) {
            try {
                this._globalShortcut.unregisterAll();
                console.log('ActivityMonitor: Unregistered all global shortcuts');
            } catch (error) {
                console.warn('ActivityMonitor: Error unregistering shortcuts:', error.message);
            }
        }

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
