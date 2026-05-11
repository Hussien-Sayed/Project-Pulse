import { v4 as uuidv4 } from 'uuid';

/**
 * Manages elapsed time for a single tracking session.
 * Pure time logic — no side effects.
 */
export default class SessionManager {
    constructor() {
        this.sessionId = null;
        this.title = '';
        this.status = 'idle'; // 'idle' | 'running' | 'paused' | 'stopped'
        this.startTime = null;
        this.pausedAt = null;
        this.elapsedMs = 0;
    }

    /**
     * Initializes a new session
     * @param {string} title 
     */
    createSession(title) {
        this.sessionId = uuidv4();
        this.title = title;
        this.status = 'running';
        this.startTime = Date.now();
        this.pausedAt = null;
        this.elapsedMs = 0;
    }

    /**
     * Pauses the current session
     */
    pause() {
        if (this.status !== 'running') return;
        
        const now = Date.now();
        this.elapsedMs += (now - this.startTime);
        this.pausedAt = now;
        this.status = 'paused';
    }

    /**
     * Resumes a paused session
     */
    resume() {
        if (this.status !== 'paused') return;
        
        this.startTime = Date.now();
        this.pausedAt = null;
        this.status = 'running';
    }

    /**
     * Stops the current session
     */
    stop() {
        if (this.status === 'running') {
            this.elapsedMs += (Date.now() - this.startTime);
        }
        this.status = 'stopped';
    }

    /**
     * Calculates the total elapsed time including the current running interval
     * @returns {number}
     */
    getElapsedMs() {
        if (this.status === 'running') {
            return this.elapsedMs + (Date.now() - this.startTime);
        }
        return this.elapsedMs;
    }

    /**
     * Returns a plain object representation of the session
     * @returns {Object}
     */
    serializeSession() {
        return {
            sessionId: this.sessionId,
            title: this.title,
            status: this.status,
            startTime: this.startTime,
            elapsedMs: this.getElapsedMs()
        };
    }
}
