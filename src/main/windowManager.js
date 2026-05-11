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
            frame: false,
            resizable: false,
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
        
        win.on('closed', () => {
            this.windows.delete('tracker');
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
            this.windows.get('dashboard').focus();
            return this.windows.get('dashboard');
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

        win.on('closed', () => {
            this.windows.delete('dashboard');
        });

        this.windows.set('dashboard', win);
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
