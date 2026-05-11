import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Environment configuration and validation
 */
const config = {
    DB_PATH: process.env.DB_PATH || path.join(__dirname, '../../data/sessions.db'),
    NODE_ENV: process.env.NODE_ENV || 'development',
    IS_DEV: process.env.NODE_ENV !== 'production'
};

// Resolve absolute path for DB
if (!path.isAbsolute(config.DB_PATH)) {
    config.DB_PATH = path.resolve(config.DB_PATH);
}

export const DB_PATH = config.DB_PATH;
export const NODE_ENV = config.NODE_ENV;
export const IS_DEV = config.IS_DEV;

export default config;
