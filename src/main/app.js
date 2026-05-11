import database from '../storage/database.js';
import trackerController from '../tracker/trackerController.js';
import reportService from '../analytics/reportService.js';

/**
 * Initializes all core services and wires dependencies.
 * This is the main entry point for the application logic in the main process.
 */
export async function initApp() {
    console.log('App: Initializing services...');
    
    try {
        // 1. Initialize Database
        database.connect();
        database.initSchema();
        
        // 2. Return initialized services for IPC registration
        console.log('App: All services initialized successfully');
        return {
            trackerController,
            reportService
        };
    } catch (error) {
        console.error('App: Failed to initialize application:', error);
        throw error;
    }
}
