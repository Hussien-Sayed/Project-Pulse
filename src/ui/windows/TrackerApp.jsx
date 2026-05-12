import React, { useState, useEffect } from 'react';
import AutocompleteInput from '../components/AutocompleteInput.jsx';
import TimerControls from '../components/TimerControls.jsx';
import LiveTimer from '../components/LiveTimer.jsx';
import ActivityBadge from '../components/ActivityBadge.jsx';

/**
 * Root component for the floating tracker window.
 */
const TrackerApp = () => {
    const [title, setTitle] = useState('');
    const [project, setProject] = useState('');
    const [status, setStatus] = useState('idle');
    const [elapsedMs, setElapsedMs] = useState(0);
    const [eventCount, setEventCount] = useState(0);
    const [taskSuggestions, setTaskSuggestions] = useState([]);
    const [projectSuggestions, setProjectSuggestions] = useState([]);

    const [isExpanded, setIsExpanded] = useState(window.innerHeight > 150);

    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerHeight > 150);
        };
        window.addEventListener('resize', handleResize);
        
        // Listen for ticks from main process
        const unsub = window.electronAPI.onTickUpdate((data) => {
            if (data) {
                setElapsedMs(data.dailyTotalMs ?? data.elapsedMs);
                setEventCount(data.eventCount);
                setStatus(data.status);
                if (data.title && !title) setTitle(data.title);
            }
        });

        // Load current session if one is already running
        window.electronAPI.getCurrentSession().then(session => {
            if (session) {
                setTitle(session.title || '');
                setProject(session.project || '');
                setStatus(session.status);
                setElapsedMs(session.dailyTotalMs ?? session.elapsedMs);
                setEventCount(session.eventCount);
            }
        });

        // Load suggestions
        window.electronAPI.getTasks().then(setTaskSuggestions);
        window.electronAPI.getProjects().then(setProjectSuggestions);

        const handleActivity = (e) => {
            const type = e.type === 'keydown' ? 'keystroke' : 'click';
            window.electronAPI.reportActivity(type);
        };

        window.addEventListener('mousedown', handleActivity);
        window.addEventListener('keydown', handleActivity);

        return () => {
            unsub();
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousedown', handleActivity);
            window.removeEventListener('keydown', handleActivity);
        };
    }, []);

    const handleStart = async () => {
        if (!title.trim()) return;
        const session = await window.electronAPI.startTracking(title, project);
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
        const session = await window.electronAPI.stopTracking();
        setStatus('idle');
        setElapsedMs(session ? session.dailyTotalMs : 0);
        setEventCount(0);
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
                {isExpanded && (
                    <div className="input-section">
                        <AutocompleteInput 
                            id="task-input"
                            label="What are you working on?"
                            value={title} 
                            onChange={setTitle} 
                            placeholder="Enter task name"
                            options={taskSuggestions}
                            disabled={status !== 'idle'} 
                        />
                        <AutocompleteInput 
                            id="project-input"
                            label="Project (Optional)"
                            value={project} 
                            onChange={setProject} 
                            placeholder="Select or enter project"
                            options={projectSuggestions}
                            disabled={status !== 'idle'} 
                        />
                    </div>
                )}

                <div className="timer-section">
                    <LiveTimer elapsedMs={elapsedMs} />
                    <ActivityBadge eventCount={eventCount} />
                </div>

                {isExpanded && (
                    <TimerControls 
                        status={status}
                        onStart={handleStart}
                        onPause={handlePause}
                        onResume={handleResume}
                        onStop={handleStop}
                        onOpenDashboard={handleOpenDashboard}
                    />
                )}
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
                    gap: 12px;
                    align-items: center;
                    width: 100%;
                }
                .input-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    width: 100%;
                }
                .timer-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    margin: 8px 0;
                }
            `}</style>
        </div>
    );
};

export default TrackerApp;
