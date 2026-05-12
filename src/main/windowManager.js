const BrowserWindow = (typeof process !== 'undefined' && process.versions && process.versions.electron) 
    ? (await import('electron')).default.BrowserWindow 
    : class { constructor() {} loadFile() {} on() {} };
import path from 'path';
import { fileURLToPath } from 'url';
import { TRACKER_WINDOW_SIZE, DASHBOARD_WINDOW_SIZE } from '../config/constants.js';
import { IS_DEV } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Manages Electron BrowserWindow instances
 */
class WindowManager {
    constructor() {
        this.windows = new Map();
    }

    /**
     * Creates the small floating tracker window
     * @returns {BrowserWindow}
     */
    createTrackerWindow() {
        if (this.windows.has('tracker')) {
            this.windows.get('tracker').focus();
            return this.windows.get('tracker');
        }

        const win = new BrowserWindow({
            width: TRACKER_WINDOW_SIZE.width,
            height: TRACKER_WINDOW_SIZE.height,
            alwaysOnTop: true,
            frame: true,
            resizable: true,
            webPreferences: {
                preload: path.join(__dirname, '../../electron/preload.js'),
                contextIsolation: true,
                nodeIntegration: false
            }
        });

        if (IS_DEV) {
            win.loadURL('http://localhost:5173/tracker.html');
        } else {
            win.loadFile(path.join(__dirname, '../ui/tracker.html'));
        }
        
        win.setMenu(null);
        
        win.on('closed', async () => {
            this.windows.delete('tracker');
            const { app } = (await import('electron')).default;
            app.quit();
        });

        this.windows.set('tracker', win);
        return win;
    }

    /**
     * Creates the larger dashboard window
     * @returns {BrowserWindow}
     */
    createDashboardWindow() {
        if (this.windows.has('dashboard')) {
            const dashWin = this.windows.get('dashboard');
            if (dashWin.isVisible()) {
                dashWin.hide();
                const trackerWin = this.windows.get('tracker');
                if (trackerWin) trackerWin.show();
            } else {
                dashWin.show();
                const trackerWin = this.windows.get('tracker');
                if (trackerWin) trackerWin.hide();
            }
            return dashWin;
        }

        const win = new BrowserWindow({
            width: DASHBOARD_WINDOW_SIZE.width,
            height: DASHBOARD_WINDOW_SIZE.height,
            webPreferences: {
                preload: path.join(__dirname, '../../electron/preload.js'),
                contextIsolation: true,
                nodeIntegration: false
            }
        });

        if (IS_DEV) {
            win.loadURL('http://localhost:5173/dashboard.html');
        } else {
            win.loadFile(path.join(__dirname, '../ui/dashboard.html'));
        }

        win.setMenu(null);

        win.on('closed', async () => {
            this.windows.delete('dashboard');
            const { app } = (await import('electron')).default;
            app.quit();
        });

        this.windows.set('dashboard', win);
        
        // Hide tracker when showing dashboard
        const trackerWin = this.windows.get('tracker');
        if (trackerWin) trackerWin.hide();

        return win;
    }

    getTrackerWindow() {
        return this.windows.get('tracker');
    }

    getDashboardWindow() {
        return this.windows.get('dashboard');
    }

    /**
     * Closes a window by name
     * @param {string} name 
     */
    closeWindow(name) {
        const win = this.windows.get(name);
        if (win) {
            win.close();
        }
    }

    /**
     * Toggles window visibility
     * @param {string} name 
     */
    toggleWindow(name) {
        const win = this.windows.get(name);
        if (win) {
            if (win.isVisible()) {
                win.hide();
            } else {
                win.show();
            }
        }
    }
}

const windowManager = new WindowManager();
export default windowManager;
