const { contextBridge, ipcRenderer } = require('electron');

/**
 * Securely expose Electron APIs to the renderer process
 */
contextBridge.exposeInMainWorld('electronAPI', {
    // Tracking commands
    startTracking: (title) => ipcRenderer.invoke('tracker:start', title),
    pauseTracking: () => ipcRenderer.invoke('tracker:pause'),
    resumeTracking: () => ipcRenderer.invoke('tracker:resume'),
    stopTracking: () => ipcRenderer.invoke('tracker:stop'),
    
    // Data retrieval
    getCurrentSession: () => ipcRenderer.invoke('tracker:current'),
    getSessions: () => ipcRenderer.invoke('sessions:getAll'),
    getSessionReport: (sessionId) => ipcRenderer.invoke('sessions:report', sessionId),
    getAllSummary: () => ipcRenderer.invoke('sessions:summary'),
    
    // Window management
    openDashboard: () => ipcRenderer.invoke('window:open-dashboard'),
    
    // Event listeners
    onTickUpdate: (callback) => {
        const subscription = (event, data) => callback(data);
        ipcRenderer.on('tracker:tick', subscription);
        return () => ipcRenderer.removeListener('tracker:tick', subscription);
    }
});
