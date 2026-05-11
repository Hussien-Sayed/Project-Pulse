import windowManager from './windowManager.js';

/**
 * Registers all IPC handlers and wires events to the renderer.
 * This is the bridge between the Electron main process and the React renderer.
 */
class IPCHandlers {
    /**
     * Registers all ipcMain.handle listeners
     * @param {import('electron').IpcMain} ipcMain 
     * @param {Object} services 
     */
    register(ipcMain, { trackerController, reportService }) {
        // Tracker actions
        ipcMain.handle('tracker:start',   (_, title) => trackerController.startSession(title));
        ipcMain.handle('tracker:pause',   ()         => trackerController.pauseSession());
        ipcMain.handle('tracker:resume',  ()         => trackerController.resumeSession());
        ipcMain.handle('tracker:stop',    ()         => trackerController.stopSession());
        ipcMain.handle('tracker:current', ()         => trackerController.getCurrentSession());

        // Session data & analytics
        ipcMain.handle('sessions:getAll', ()         => reportService.getAllSessionsSummary());
        ipcMain.handle('sessions:report', (_, id)    => reportService.getSessionReport(id));
        ipcMain.handle('sessions:summary',()         => reportService.getAllSessionsSummary());

        // Window management
        ipcMain.handle('window:open-dashboard', ()   => windowManager.createDashboardWindow());
        
        console.log('IPCHandlers: All handlers registered');
    }

    /**
     * Forwards domain events to the appropriate renderer windows
     * @param {Object} eventBus 
     */
    forwardEvents(eventBus) {
        eventBus.on('tracker:tick', (data) => {
            const trackerWin = windowManager.getTrackerWindow();
            if (trackerWin && !trackerWin.isDestroyed()) {
                trackerWin.webContents.send('tracker:tick', data);
            }
        });
        
        console.log('IPCHandlers: Event forwarding active');
    }
}

const ipcHandlers = new IPCHandlers();
export default ipcHandlers;
