import database from './database.js';

/**
 * Repository for CRUD operations on the sessions table.
 */
class SessionRepository {
    constructor() {
        this.db = null;
    }

    _ensureConnected() {
        if (!this.db) {
            this.db = database.connect();
        }
    }

    /**
     * Creates a new session record
     * @param {Object} data 
     * @returns {Object} The inserted row
     */
    create(data) {
        this._ensureConnected();
        const {
            id, title, status, start_time, 
            created_at = Date.now(),
            elapsed_ms = 0, idle_ms = 0, 
            click_count = 0, keystroke_count = 0 
        } = data;

        const stmt = this.db.prepare(`
            INSERT INTO sessions (
                id, title, status, start_time, created_at, 
                elapsed_ms, idle_ms, click_count, keystroke_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(id, title, status, start_time, created_at, elapsed_ms, idle_ms, click_count, keystroke_count);
        
        return this.findById(id);
    }

    /**
     * Updates an existing session record
     * @param {string} id 
     * @param {Object} data 
     */
    update(id, data) {
        this._ensureConnected();
        const fields = Object.keys(data);
        if (fields.length === 0) return;

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => data[f]);
        values.push(id);

        const stmt = this.db.prepare(`UPDATE sessions SET ${setClause} WHERE id = ?`);
        stmt.run(...values);
    }

    /**
     * Finds a session by ID
     * @param {string} id 
     * @returns {Object|undefined}
     */
    findById(id) {
        this._ensureConnected();
        return this.db.prepare("SELECT * FROM sessions WHERE id = ?").get(id);
    }

    /**
     * Retrieves sessions with optional filtering
     * @param {Object} filters 
     * @returns {Array}
     */
    findAll({ limit = 50, offset = 0, dateFrom, dateTo } = {}) {
        this._ensureConnected();
        let query = "SELECT * FROM sessions";
        const params = [];

        if (dateFrom && dateTo) {
            query += " WHERE created_at BETWEEN ? AND ?";
            params.push(dateFrom, dateTo);
        }

        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        return this.db.prepare(query).all(...params);
    }

    /**
     * Deletes a session by ID
     * @param {string} id 
     */
    deleteById(id) {
        this._ensureConnected();
        this.db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
    }
}

const sessionRepository = new SessionRepository();
export default sessionRepository;
