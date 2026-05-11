import React from 'react';

/**
 * Start / Pause / Resume / Stop button group
 */
const TimerControls = ({ status, onStart, onPause, onResume, onStop, onOpenDashboard }) => {
    return (
        <div className="controls-group">
            <div className="main-actions">
                {status === 'idle' && (
                    <button className="btn-primary" onClick={onStart}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        Start Session
                    </button>
                )}

                {status === 'running' && (
                    <button className="btn-ghost" onClick={onPause}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        Pause
                    </button>
                )}

                {status === 'paused' && (
                    <button className="btn-primary" onClick={onResume}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        Resume
                    </button>
                )}

                {status !== 'idle' && (
                    <button className="btn-danger" onClick={onStop}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
                        Stop
                    </button>
                )}
            </div>

            <button className="btn-ghost history-btn" onClick={onOpenDashboard} title="View History">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>

            <style jsx>{`
                .controls-group {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    gap: 12px;
                }
                .main-actions {
                    display: flex;
                    gap: 8px;
                    flex: 1;
                }
                .history-btn {
                    padding: 8px;
                    min-width: 40px;
                }
            `}</style>
        </div>
    );
};

export default TimerControls;
