import React, { useState, useEffect } from 'react';
import SessionList from '../components/SessionList.jsx';
import SessionDetail from '../components/SessionDetail.jsx';

/**
 * Root component for the dashboard window.
 */
const DashboardApp = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [groupBy, setGroupBy] = useState('date'); // 'date' | 'project'
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [showProjectFilter, setShowProjectFilter] = useState(false);

    useEffect(() => {
        loadSessions();

        const handleActivity = (e) => {
            const type = e.type === 'keydown' ? 'keystroke' : 'click';
            window.electronAPI.reportActivity(type);
        };

        window.addEventListener('mousedown', handleActivity);
        window.addEventListener('keydown', handleActivity);

        return () => {
            window.removeEventListener('mousedown', handleActivity);
            window.removeEventListener('keydown', handleActivity);
        };
    }, []);

    const loadSessions = async () => {
        setLoading(true);
        try {
            const data = await window.electronAPI.getSessions();
            setSessions(data || []);
            
            const projList = await window.electronAPI.getProjects();
            setProjects(projList || []);

            if (data && data.length > 0 && !selectedId) {
                handleSelect(data[0].id);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (id) => {
        setSelectedId(id);
        const data = await window.electronAPI.getSessionReport(id);
        setReport(data);
    };

    const toggleProjectFilter = (proj) => {
        setSelectedProjects(prev => 
            prev.includes(proj) ? prev.filter(p => p !== proj) : [...prev, proj]
        );
    };

    const filteredSessions = sessions.filter(s => 
        selectedProjects.length === 0 || selectedProjects.includes(s.project)
    );

    return (
        <div className={`dashboard-container ${sidebarCollapsed ? 'collapsed' : ''}`}>
            {!sidebarCollapsed && (
                <aside className="sidebar">
                    <header>
                        <div className="header-top">
                            <button className="btn-ghost back-btn" onClick={() => window.electronAPI.openDashboard()} title="Back to Tracker">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                                </svg>
                            </button>
                            <h1>History</h1>
                            <button className="btn-ghost collapse-btn" onClick={() => setSidebarCollapsed(true)} title="Collapse Sidebar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                                </svg>
                            </button>
                        </div>
                        <div className="header-actions">
                            <button className="btn-ghost" onClick={loadSessions} title="Refresh">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <div className="filter-container">
                                <button className={`btn-ghost filter-btn ${selectedProjects.length > 0 ? 'active' : ''}`} onClick={() => setShowProjectFilter(!showProjectFilter)} title="Filter by Project">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                    </svg>
                                    {selectedProjects.length > 0 && <span className="filter-count">{selectedProjects.length}</span>}
                                </button>
                                {showProjectFilter && (
                                    <div className="filter-dropdown">
                                        <h4>Filter Projects</h4>
                                        <div className="filter-options">
                                            {projects.map(p => (
                                                <label key={p} className="filter-option">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedProjects.includes(p)}
                                                        onChange={() => toggleProjectFilter(p)}
                                                    />
                                                    {p}
                                                </label>
                                            ))}
                                            {projects.length === 0 && <p className="empty-msg">No projects found</p>}
                                        </div>
                                        {selectedProjects.length > 0 && (
                                            <button className="clear-link" onClick={() => setSelectedProjects([])}>Clear all</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="group-toggle">
                            <span>Group by:</span>
                            <button 
                                className={`toggle-btn ${groupBy === 'date' ? 'active' : ''}`} 
                                onClick={() => setGroupBy('date')}
                            >Date</button>
                            <button 
                                className={`toggle-btn ${groupBy === 'project' ? 'active' : ''}`} 
                                onClick={() => setGroupBy('project')}
                            >Project</button>
                        </div>
                    </header>
                    
                    {loading ? (
                        <div className="loading-state">Loading...</div>
                    ) : (
                        <SessionList 
                            sessions={filteredSessions} 
                            onSelect={handleSelect} 
                            selectedId={selectedId} 
                            groupBy={groupBy}
                        />
                    )}
                </aside>
            )}

            {sidebarCollapsed && (
                <button className="expand-btn" onClick={() => setSidebarCollapsed(false)} title="Expand Sidebar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                    </svg>
                </button>
            )}

            <main className="content">
                <SessionDetail report={report} />
            </main>

            <style jsx>{`
                .dashboard-container {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    height: 100vh;
                    background: var(--bg-main);
                    transition: grid-template-columns 0.3s ease;
                }
                .dashboard-container.collapsed {
                    grid-template-columns: 48px 1fr;
                }
                .sidebar {
                    border-right: 1px solid var(--glass-border);
                    display: flex;
                    flex-direction: column;
                    background: hsla(222, 47%, 8%, 0.5);
                    overflow: hidden;
                }
                .sidebar header {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    border-bottom: 1px solid var(--glass-border);
                }
                .header-top {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .collapse-btn {
                    margin-left: auto;
                }
                .expand-btn {
                    width: 48px;
                    height: 100%;
                    background: var(--bg-card);
                    border: none;
                    border-right: 1px solid var(--glass-border);
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: var(--transition-fast);
                }
                .expand-btn:hover {
                    color: var(--bg-accent);
                    background: var(--glass-bg);
                }
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .filter-container {
                    position: relative;
                }
                .filter-btn {
                    position: relative;
                }
                .filter-btn.active {
                    color: var(--bg-accent);
                }
                .filter-count {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: var(--bg-accent);
                    color: white;
                    font-size: 9px;
                    min-width: 14px;
                    height: 14px;
                    border-radius: 7px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                }
                .filter-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    background: var(--bg-card);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-md);
                    padding: 12px;
                    width: 200px;
                    z-index: 100;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                    margin-top: 8px;
                }
                .filter-dropdown h4 {
                    margin: 0 0 12px 0;
                    font-size: 12px;
                    text-transform: uppercase;
                    color: var(--text-muted);
                }
                .filter-options {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    max-height: 200px;
                    overflow-y: auto;
                    margin-bottom: 12px;
                }
                .filter-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    cursor: pointer;
                    color: var(--text-secondary);
                }
                .filter-option:hover {
                    color: var(--text-primary);
                }
                .clear-link {
                    background: none;
                    border: none;
                    color: var(--bg-accent);
                    font-size: 11px;
                    cursor: pointer;
                    padding: 0;
                    font-weight: 600;
                }
                .empty-msg {
                    font-size: 12px;
                    color: var(--text-muted);
                    font-style: italic;
                    margin: 0;
                }
                .group-toggle {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: var(--text-muted);
                }
                .toggle-btn {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    color: var(--text-secondary);
                    padding: 4px 12px;
                    border-radius: var(--radius-sm);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: var(--transition-fast);
                }
                .toggle-btn:hover {
                    background: var(--bg-card);
                    color: var(--text-primary);
                    border-color: var(--bg-accent);
                }
                .toggle-btn.active {
                    background: var(--bg-accent);
                    color: white;
                    border-color: var(--bg-accent);
                    font-weight: 600;
                }
                .content {
                    overflow-y: auto;
                    background: linear-gradient(135deg, var(--bg-main) 0%, hsl(222, 47%, 15%) 100%);
                }
            `}</style>
        </div>
    );
};

export default DashboardApp;
