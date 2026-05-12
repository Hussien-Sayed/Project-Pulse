const { contextBridge, ipcRenderer } = require('electron');

/**
 * Securely expose Electron APIs to the renderer process
 */
contextBridge.exposeInMainWorld('electronAPI', {
    // Tracking commands
    startTracking: (title, project) => ipcRenderer.invoke('tracker:start', title, project),
    pauseTracking: () => ipcRenderer.invoke('tracker:pause'),
    resumeTracking: () => ipcRenderer.invoke('tracker:resume'),
    stopTracking: () => ipcRenderer.invoke('tracker:stop'),
    
    // Data retrieval
    getCurrentSession: () => ipcRenderer.invoke('tracker:current'),
    getSessions: () => ipcRenderer.invoke('sessions:getAll'),
    getSessionReport: (sessionId) => ipcRenderer.invoke('sessions:report', sessionId),
    getAllSummary: () => ipcRenderer.invoke('sessions:summary'),
    getProjects: () => ipcRenderer.invoke('sessions:projects'),
    getTasks: () => ipcRenderer.invoke('sessions:tasks'),
    
    // Window management
    openDashboard: () => ipcRenderer.invoke('window:open-dashboard'),
    
    // Activity reporting
    reportActivity: (type) => ipcRenderer.send('activity:report', type),
    
    // Event listeners
    onTickUpdate: (callback) => {
        const subscription = (event, data) => callback(data);
        ipcRenderer.on('tracker:tick', subscription);
        return () => ipcRenderer.removeListener('tracker:tick', subscription);
    }
});
