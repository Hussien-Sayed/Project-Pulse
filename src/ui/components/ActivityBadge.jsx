import React from 'react';

/**
 * Displays real-time activity metrics (events)
 */
const ActivityBadge = ({ eventCount }) => {
    return (
        <div className="activity-badges">
            <div className="badge" title="Events">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span>{eventCount}</span>
            </div>
            <style jsx>{`
                .activity-badges {
                    display: flex;
                    gap: 12px;
                }
                .badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: var(--text-secondary);
                    background: var(--glass-bg);
                    padding: 4px 8px;
                    border-radius: 20px;
                    border: 1px solid var(--glass-border);
                }
                .badge span {
                    font-variant-numeric: tabular-nums;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default ActivityBadge;
