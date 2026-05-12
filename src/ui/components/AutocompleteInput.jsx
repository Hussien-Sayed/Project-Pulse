import React, { useState, useEffect, useRef } from 'react';

/**
 * A text input with autocomplete suggestions from a list of options.
 */
const AutocompleteInput = ({ id, label, value, onChange, placeholder, options = [], disabled }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        onChange(val);
        if (val.trim()) {
            const filtered = options.filter(opt => 
                opt.toLowerCase().includes(val.toLowerCase())
            );
            setFilteredOptions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleFocus = () => {
        if (options.length > 0) {
            setFilteredOptions(options);
            setShowSuggestions(true);
        }
    };

    const selectOption = (opt) => {
        onChange(opt);
        setShowSuggestions(false);
    };

    return (
        <div className="autocomplete-container" ref={containerRef}>
            <label htmlFor={id}>{label}</label>
            <input 
                id={id}
                type="text" 
                placeholder={placeholder} 
                value={value}
                onChange={handleInputChange}
                onFocus={handleFocus}
                disabled={disabled}
                autoComplete="off"
            />
            
            {showSuggestions && filteredOptions.length > 0 && (
                <ul className="suggestions-list">
                    {filteredOptions.map((opt, i) => (
                        <li key={i} onClick={() => selectOption(opt)}>{opt}</li>
                    ))}
                </ul>
            )}

            <style jsx>{`
                .autocomplete-container {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    width: 100%;
                    position: relative;
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
                .suggestions-list {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: var(--bg-card);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-sm);
                    margin: 4px 0 0 0;
                    padding: 0;
                    list-style: none;
                    max-height: 150px;
                    overflow-y: auto;
                    z-index: 100;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                }
                .suggestions-list li {
                    padding: 8px 12px;
                    cursor: pointer;
                    font-size: 13px;
                    color: var(--text-secondary);
                    transition: var(--transition-fast);
                }
                .suggestions-list li:hover {
                    background: var(--glass-bg);
                    color: var(--text-primary);
                }
            `}</style>
        </div>
    );
};

export default AutocompleteInput;
