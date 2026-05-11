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

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        setLoading(true);
        try {
            const data = await window.electronAPI.getSessions();
            setSessions(data || []);
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

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <header>
                    <h1>History</h1>
                    <button className="btn-ghost" onClick={loadSessions} title="Refresh">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </header>
                
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : (
                    <SessionList 
                        sessions={sessions} 
                        onSelect={handleSelect} 
                        selectedId={selectedId} 
                    />
                )}
            </aside>

            <main className="content">
                <SessionDetail report={report} />
            </main>

            <style jsx>{`
                .dashboard-container {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    height: 100vh;
                    background: var(--bg-main);
                }
                .sidebar {
                    border-right: 1px solid var(--glass-border);
                    display: flex;
                    flex-direction: column;
                    background: hsla(222, 47%, 8%, 0.5);
                }
                .sidebar header {
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid var(--glass-border);
                }
                .sidebar h1 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 700;
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
