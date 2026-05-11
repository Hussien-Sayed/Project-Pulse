import React from 'react';

/**
 * Displays formatted elapsed time (HH:MM:SS)
 */
const LiveTimer = ({ elapsedMs }) => {
    const formatDuration = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num) => String(num).padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    return (
        <div className="timer-display">
            <span className="timer-time">{formatDuration(elapsedMs)}</span>
            <style jsx>{`
                .timer-display {
                    font-size: 42px;
                    font-weight: 700;
                    font-variant-numeric: tabular-nums;
                    color: var(--text-primary);
                    text-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    letter-spacing: -1px;
                }
            `}</style>
        </div>
    );
};

export default LiveTimer;
