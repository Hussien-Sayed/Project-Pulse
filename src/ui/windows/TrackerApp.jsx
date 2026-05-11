import React, { useState, useEffect } from 'react';
import SessionInput from '../components/SessionInput.jsx';
import TimerControls from '../components/TimerControls.jsx';
import LiveTimer from '../components/LiveTimer.jsx';
import ActivityBadge from '../components/ActivityBadge.jsx';

/**
 * Root component for the floating tracker window.
 */
const TrackerApp = () => {
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('idle');
    const [elapsedMs, setElapsedMs] = useState(0);
    const [clickCount, setClickCount] = useState(0);
    const [keystrokeCount, setKeystrokeCount] = useState(0);

    useEffect(() => {
        // Listen for ticks from main process
        const unsub = window.electronAPI.onTickUpdate((data) => {
            if (data) {
                setElapsedMs(data.elapsedMs);
                setClickCount(data.clickCount);
                setKeystrokeCount(data.keystrokeCount);
                setStatus(data.status);
                if (data.title && !title) setTitle(data.title);
            }
        });

        // Load current session if one is already running
        window.electronAPI.getCurrentSession().then(session => {
            if (session) {
                setTitle(session.title);
                setStatus(session.status);
                setElapsedMs(session.elapsedMs);
                setClickCount(session.clickCount);
                setKeystrokeCount(session.keystrokeCount);
            }
        });

        return () => unsub();
    }, []);

    const handleStart = async () => {
        if (!title.trim()) return;
        const session = await window.electronAPI.startTracking(title);
        if (session) setStatus('running');
    };

    const handlePause = async () => {
        await window.electronAPI.pauseTracking();
        setStatus('paused');
    };

    const handleResume = async () => {
        await window.electronAPI.resumeTracking();
        setStatus('running');
    };

    const handleStop = async () => {
        await window.electronAPI.stopTracking();
        setStatus('idle');
        setElapsedMs(0);
        setClickCount(0);
        setKeystrokeCount(0);
        setTitle('');
    };

    const handleOpenDashboard = () => {
        window.electronAPI.openDashboard();
    };

    return (
        <div className="tracker-container animate-fade-in">
            <header className="drag-region">
                <span className="app-name">Project Pulse</span>
                <div className="status-dot" style={{ background: status === 'running' ? 'var(--success)' : 'var(--text-muted)' }}></div>
            </header>

            <main>
                <SessionInput 
                    value={title} 
                    onChange={setTitle} 
                    disabled={status !== 'idle'} 
                />

                <div className="timer-section">
                    <LiveTimer elapsedMs={elapsedMs} />
                    <ActivityBadge clickCount={clickCount} keystrokeCount={keystrokeCount} />
                </div>

                <TimerControls 
                    status={status}
                    onStart={handleStart}
                    onPause={handlePause}
                    onResume={handleResume}
                    onStop={handleStop}
                    onOpenDashboard={handleOpenDashboard}
                />
            </main>

            <style jsx>{`
                .tracker-container {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    height: 100vh;
                    background: var(--bg-main);
                    border: 1px solid var(--glass-border);
                }
                .drag-region {
                    -webkit-app-region: drag;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }
                .app-name {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    box-shadow: 0 0 8px currentColor;
                }
                main {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    align-items: center;
                }
                .timer-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
            `}</style>
        </div>
    );
};

export default TrackerApp;
