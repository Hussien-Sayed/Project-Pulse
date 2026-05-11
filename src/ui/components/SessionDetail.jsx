import React from 'react';

/**
 * Detailed view of a single session with metrics breakdown
 */
const SessionDetail = ({ report }) => {
    if (!report) return (
        <div className="empty-detail">
            <p>Select a session to view details</p>
        </div>
    );

    const { session, metrics } = report;

    return (
        <div className="session-detail animate-fade-in">
            <header>
                <h2>{session.title || 'Untitled Session'}</h2>
                <span className="timestamp">{new Date(session.created_at).toLocaleString()}</span>
            </header>

            <div className="metrics-grid">
                <MetricCard 
                    label="Productivity Score" 
                    value={Math.round(metrics.productivityScore)} 
                    sub="out of 100"
                    color={metrics.productivityScore > 70 ? 'var(--success)' : 'var(--warning)'}
                />
                <MetricCard 
                    label="Total Duration" 
                    value={Math.floor(session.elapsed_ms / 60000)} 
                    sub="minutes"
                />
                <MetricCard 
                    label="Activity Rate" 
                    value={metrics.activityRate.toFixed(1)} 
                    sub="events / min"
                />
                <MetricCard 
                    label="Idle Time" 
                    value={Math.round(metrics.idlePercentage)} 
                    sub="%"
                />
            </div>

            <div className="stats-breakdown">
                <div className="stat-row">
                    <span>Mouse Clicks</span>
                    <span>{session.click_count}</span>
                </div>
                <div className="stat-row">
                    <span>Keystrokes</span>
                    <span>{session.keystroke_count}</span>
                </div>
                <div className="stat-row">
                    <span>Idle Duration</span>
                    <span>{Math.floor(session.idle_ms / 60000)}m {Math.floor((session.idle_ms % 60000) / 1000)}s</span>
                </div>
            </div>

            <style jsx>{`
                .session-detail {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                    height: 100%;
                }
                header h2 {
                    margin: 0;
                    font-size: 24px;
                }
                .timestamp {
                    color: var(--text-muted);
                    font-size: 14px;
                }
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 16px;
                }
                .stats-breakdown {
                    background: var(--bg-card);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: 20px;
                }
                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid var(--glass-border);
                }
                .stat-row:last-child { border-bottom: none; }
                .stat-row span:last-child { font-weight: 600; color: var(--text-primary); }
                .empty-detail {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
};

const MetricCard = ({ label, value, sub, color }) => (
    <div className="metric-card">
        <span className="label">{label}</span>
        <span className="value" style={{ color: color || 'var(--text-primary)' }}>{value}</span>
        <span className="sub">{sub}</span>
        <style jsx>{`
            .metric-card {
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: var(--radius-lg);
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            .label { font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; }
            .value { font-size: 32px; font-weight: 700; }
            .sub { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
        `}</style>
    </div>
);

export default SessionDetail;
