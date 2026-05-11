import React from 'react';

/**
 * Displays real-time activity metrics (clicks and keystrokes)
 */
const ActivityBadge = ({ clickCount, keystrokeCount }) => {
    return (
        <div className="activity-badges">
            <div className="badge" title="Mouse Clicks">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M5 7v10M19 7v10" />
                </svg>
                <span>{clickCount}</span>
            </div>
            <div className="badge" title="Keystrokes">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 16h.01M10 16h.01M14 16h.01M18 16h.01" />
                </svg>
                <span>{keystrokeCount}</span>
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
