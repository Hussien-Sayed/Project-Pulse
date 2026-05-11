import React from 'react';

/**
 * Controlled text input for session title
 */
const SessionInput = ({ value, onChange, disabled }) => {
    return (
        <div className="input-group">
            <label htmlFor="session-title">What are you working on?</label>
            <input 
                id="session-title"
                type="text" 
                placeholder="Enter project name or task..." 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            />
            <style jsx>{`
                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    width: 100%;
                }
                label {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--text-muted);
                    font-weight: 600;
                }
                input {
                    width: 100%;
                }
            `}</style>
        </div>
    );
};

export default SessionInput;
