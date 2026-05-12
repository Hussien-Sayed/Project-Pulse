/**
 * Log Settings Configuration
 * Controls which modules can output console logs
 * Set to true to enable logs for specific modules
 */

export const LOG_SETTINGS = {
    // Activity Monitor logs
    activityMonitor: {
        debug: false,           // 🔍 DEBUG: detailed timing info
        detection: true,       // 🎯 DETECTED: activity detection
        events: false,           // � Event counting
        general: false,         // General activity monitor messages
    },
    
    // Tracker Controller logs
    trackerController: {
        start: false,           // Session start/stop messages
        tick: false,            // Periodic tick events
        sync: false,            // Database sync operations
        general: false,         // General tracker messages
    },
    
    // Session Manager logs
    sessionManager: {
        lifecycle: false,       // Session lifecycle events
        timing: false,          // Timing calculations
        general: false,         // General session messages
    },
    
    // Idle Detector logs
    idleDetector: {
        detection: true,        // Idle state changes
        reset: true,           // Idle timer resets
        general: true,         // General idle detector messages
    },
    
    // Database/Storage logs
    storage: {
        queries: false,         // Database queries
        operations: false,      // CRUD operations
        errors: false,          // Storage errors
        general: false,         // General storage messages
    },
    
    // Analytics/Reporting logs
    analytics: {
        calculations: false,    // Metric calculations
        reports: false,         // Report generation
        general: false,         // General analytics messages
    },
    
    // IPC Handler logs
    ipcHandlers: {
        registration: false,    // Handler registration
        requests: false,        // IPC requests
        errors: false,          // IPC errors
        general: false,         // General IPC messages
    },
    
    // Window Manager logs
    windowManager: {
        creation: false,        // Window creation
        events: false,          // Window events
        general: false,         // General window messages
    },
    
    // Event Bus logs
    eventBus: {
        emit: false,            // Event emissions
        listeners: false,       // Listener registration
        general: false,         // General event bus messages
    },
    
    // Main process logs
    main: {
        startup: false,         // App startup
        shutdown: false,        // App shutdown
        general: false,         // General main process messages
    },
    
    // UI Component logs
    ui: {
        rendering: false,       // Component rendering
        events: false,          // UI events
        state: false,           // State changes
        general: false,         // General UI messages
    }
};

/**
 * Helper function to check if logging is enabled for a specific module and category
 */
export function shouldLog(module, category = 'general') {
    return LOG_SETTINGS[module]?.[category] === true;
}

/**
 * Conditional logging function
 */
export function logIf(module, category, ...args) {
    if (shouldLog(module, category)) {
        console.log(...args);
    }
}

/**
 * Conditional warning function
 */
export function warnIf(module, category, ...args) {
    if (shouldLog(module, category)) {
        console.warn(...args);
    }
}

/**
 * Conditional error function
 */
export function errorIf(module, category, ...args) {
    if (shouldLog(module, category)) {
        console.error(...args);
    }
}
