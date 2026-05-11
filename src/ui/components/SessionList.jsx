import React from 'react';

/**
 * Scrollable list of past sessions for dashboard
 */
const SessionList = ({ sessions, onSelect, selectedId }) => {
    const formatDate = (ts) => new Date(ts).toLocaleDateString();
    const formatDuration = (ms) => {
        const mins = Math.floor(ms / 60000);
        const hrs = Math.floor(mins / 60);
        return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
    };

    return (
        <div className="session-list">
            {sessions.map(s => (
                <div 
                    key={s.id} 
                    className={`session-item ${selectedId === s.id ? 'active' : ''}`}
                    onClick={() => onSelect(s.id)}
                >
                    <div className="item-main">
                        <span className="item-title">{s.title || 'Untitled Session'}</span>
                        <span className="item-date">{formatDate(s.created_at)}</span>
                    </div>
                    <div className="item-stats">
                        <span className="item-duration">{formatDuration(s.elapsed_ms)}</span>
                        <div className="score-pill" style={{ 
                            '--pill-color': s.metrics.productivityScore > 70 ? 'var(--success)' : 
                                            s.metrics.productivityScore > 40 ? 'var(--warning)' : 'var(--danger)'
                        }}>
                            {Math.round(s.metrics.productivityScore)}
                        </div>
                    </div>
                </div>
            ))}
            <style jsx>{`
                .session-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 16px;
                    overflow-y: auto;
                    height: 100%;
                }
                .session-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: var(--bg-card);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: var(--transition-fast);
                }
                .session-item:hover {
                    background: var(--glass-bg);
                    transform: translateX(4px);
                }
                .session-item.active {
                    border-color: var(--bg-accent);
                    background: hsla(217, 91%, 60%, 0.1);
                }
                .item-main {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .item-title {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .item-date {
                    font-size: 12px;
                    color: var(--text-muted);
                }
                .item-stats {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .item-duration {
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-variant-numeric: tabular-nums;
                }
                .score-pill {
                    background: var(--pill-color);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 700;
                }
            `}</style>
        </div>
    );
};

export default SessionList;
