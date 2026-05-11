import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { DB_PATH } from '../config/env.js';

/**
 * Manages the SQLite database connection and schema
 */
class AppDatabase {
    constructor() {
        this.db = null;
    }

    /**
     * Connects to the SQLite database
     */
    connect() {
        if (this.db) return this.db;

        // Ensure data directory exists
        const dbDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        this.db = new Database(DB_PATH, { verbose: console.log });
        this.db.pragma('journal_mode = WAL'); // Performance optimization
        
        return this.db;
    }

    /**
     * Initializes the database schema
     */
    initSchema() {
        if (!this.db) this.connect();

        const schema = `
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                status TEXT NOT NULL,
                start_time INTEGER NOT NULL,
                end_time INTEGER,
                elapsed_ms INTEGER DEFAULT 0,
                idle_ms INTEGER DEFAULT 0,
                click_count INTEGER DEFAULT 0,
                keystroke_count INTEGER DEFAULT 0,
                created_at INTEGER NOT NULL
            );
            
            CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
        `;

        this.db.exec(schema);
        console.log('Database schema initialized');
    }

    /**
     * Closes the database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

const database = new AppDatabase();
export default database;
export const db = database.db; // Note: this will be null until connect() is called
