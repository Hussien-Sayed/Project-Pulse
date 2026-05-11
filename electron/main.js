import pkg from 'electron';
const { app, ipcMain } = pkg;
import { initApp } from '../src/main/app.js';
import windowManager from '../src/main/windowManager.js';
import ipcHandlers from '../src/main/ipcHandlers.js';
import eventBus from '../src/utils/eventBus.js';

/**
 * Electron Main Process Entry Point
 */

async function startApp() {
    try {
        // 1. Initialize application logic and services
        const services = await initApp();

        // 2. Register IPC handlers
        ipcHandlers.register(ipcMain, services);

        // 3. Start event forwarding to renderer
        ipcHandlers.forwardEvents(eventBus);

        // 4. Create initial window when Electron is ready
        app.whenReady().then(() => {
            windowManager.createTrackerWindow();

            app.on('activate', () => {
                if (windowManager.windows.size === 0) {
                    windowManager.createTrackerWindow();
                }
            });
        });

        // 5. Handle app lifecycle
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

    } catch (error) {
        console.error('Failed to start Electron app:', error);
        process.exit(1);
    }
}

// Start the bootstrap process
startApp();
