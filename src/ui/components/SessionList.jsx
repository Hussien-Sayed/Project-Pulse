import { formatDuration } from '../../utils/timeUtils.js';
import React, { useState } from 'react';

/**
 * Scrollable list of past sessions for dashboard
 */
const SessionList = ({ sessions, onSelect, selectedId, groupBy = 'date' }) => {
    const [collapsedGroups, setCollapsedGroups] = useState(new Set());
    const [collapsedDays, setCollapsedDays] = useState(new Set());

    const toggleGroup = (groupKey) => {
        setCollapsedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupKey)) {
                newSet.delete(groupKey);
            } else {
                newSet.add(groupKey);
            }
            return newSet;
        });
    };

    const toggleDay = (dayKey) => {
        setCollapsedDays(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dayKey)) {
                newSet.delete(dayKey);
            } else {
                newSet.add(dayKey);
            }
            return newSet;
        });
    };
    const formatDate = (ts) => new Date(ts).toLocaleDateString();
    const formatDurationStr = (ms) => {
        const mins = Math.ceil(ms / 60000);
        const hrs = Math.floor(mins / 60);
        return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
    };

    // Grouping logic
    const groups = {};
    sessions.forEach(s => {
        if (groupBy === 'date') {
            const date = new Date(s.created_at);
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            const weekKey = `Week ${weekNum}, ${date.getFullYear()}`;
            
            const dayKey = formatDate(s.created_at);
            
            if (!groups[weekKey]) groups[weekKey] = {};
            if (!groups[weekKey][dayKey]) groups[weekKey][dayKey] = [];
            groups[weekKey][dayKey].push(s);
        } else {
            const projectKey = s.project || 'Uncategorized';
            const dayKey = formatDate(s.created_at);
            
            if (!groups[projectKey]) groups[projectKey] = {};
            if (!groups[projectKey][dayKey]) groups[projectKey][dayKey] = [];
            groups[projectKey][dayKey].push(s);
        }
    });

    return (
        <div className="session-list">
            {Object.entries(groups).map(([groupKey, days]) => (
                <div key={groupKey} className="week-group">
                    <h3 className="week-header" onClick={() => toggleGroup(groupKey)}>
                        <span className="header-icon">
                            {collapsedGroups.has(groupKey) ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6"/>
                                </svg>
                            ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 9l6 6 6-6"/>
                                </svg>
                            )}
                        </span>
                        {groupKey}
                    </h3>
                    {!collapsedGroups.has(groupKey) && Object.entries(days).map(([day, daySessions]) => (
                        <div key={day} className="day-group">
                            <h4 className="day-header" onClick={() => toggleDay(day)}>
                                <span className="header-icon">
                                    {collapsedDays.has(day) ? (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 18l6-6-6-6"/>
                                        </svg>
                                    ) : (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 9l6 6 6-6"/>
                                        </svg>
                                    )}
                                </span>
                                {day}
                            </h4>
                            {!collapsedDays.has(day) && daySessions.map(s => (
                                <div 
                                    key={s.id} 
                                    className={`session-item ${selectedId === s.id ? 'active' : ''}`}
                                    onClick={() => onSelect(s.id)}
                                >
                                    <div className="item-main">
                                        <span className="item-title">{s.title || 'Untitled Session'}</span>
                                        <div className="item-meta">
                                            {groupBy === 'date' && s.project && <span className="item-project">{s.project}</span>}
                                            <span className="item-time">{new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <div className="item-stats">
                                        <span className="item-duration">{formatDurationStr(s.elapsed_ms)}</span>
                                        <div className="score-pill" style={{ 
                                            '--pill-color': s.metrics.productivityScore > 70 ? 'var(--success)' : 
                                                            s.metrics.productivityScore > 40 ? 'var(--warning)' : 'var(--danger)'
                                        }}>
                                            {Math.round(s.metrics.productivityScore)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
            <style jsx>{`
                .week-group {
                    margin-bottom: 24px;
                }
                .week-header {
                    font-size: 14px;
                    color: var(--bg-accent);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                    padding-left: 8px;
                    border-left: 2px solid var(--bg-accent);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    user-select: none;
                    transition: var(--transition-fast);
                }
                .week-header:hover {
                    opacity: 0.8;
                }
                .day-header {
                    font-size: 13px;
                    color: var(--text-muted);
                    margin-bottom: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    user-select: none;
                    transition: var(--transition-fast);
                }
                .day-header:hover {
                    color: var(--text-secondary);
                }
                .header-icon {
                    display: flex;
                    align-items: center;
                    transition: transform 0.2s ease;
                }
                .header-icon svg {
                    transition: transform 0.2s ease;
                }
                .day-group {
                    margin-bottom: 16px;
                    padding-left: 12px;
                }
                .session-list {
                    display: flex;
                    flex-direction: column;
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
                    margin-bottom: 8px;
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
                .item-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .item-project {
                    font-size: 10px;
                    background: var(--bg-accent);
                    color: white;
                    padding: 1px 6px;
                    border-radius: 4px;
                    text-transform: uppercase;
                    font-weight: 700;
                    opacity: 0.8;
                }
                .item-time {
                    font-size: 11px;
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
