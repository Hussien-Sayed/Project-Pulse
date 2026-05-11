import database from '../../src/storage/database.js';
import fs from 'fs';
import path from 'path';

async function runTest() {
    const results = [];
    const logFile = 'test/storage/database_test_results.txt';
    
    if (!fs.existsSync('test/storage')) {
        fs.mkdirSync('test/storage', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting database_test ---');
    
    try {
        let passed = true;

        // 1. Test connect
        const db = database.connect();
        if (db && fs.existsSync(db.name)) {
            log(`[PASS] connect: database file created at ${db.name}`);
        } else {
            log('[FAIL] connect: failed to create/connect to database');
            passed = false;
        }

        // 2. Test initSchema
        database.initSchema();
        
        // Verify table existence
        const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'").get();
        if (tableInfo && tableInfo.name === 'sessions') {
            log('[PASS] initSchema: sessions table created');
        } else {
            log('[FAIL] initSchema: sessions table missing');
            passed = false;
        }

        // Verify columns
        const columns = db.prepare("PRAGMA table_info(sessions)").all();
        const columnNames = columns.map(c => c.name);
        const expectedColumns = ['id', 'title', 'status', 'start_time', 'end_time', 'elapsed_ms', 'idle_ms', 'click_count', 'keystroke_count', 'created_at'];
        
        const missing = expectedColumns.filter(c => !columnNames.includes(c));
        if (missing.length === 0) {
            log('[PASS] initSchema: all columns present');
        } else {
            log(`[FAIL] initSchema: missing columns: ${missing.join(', ')}`);
            passed = false;
        }

        database.close();

        if (passed) {
            log('Overall Result: SUCCESS');
        } else {
            log('Overall Result: FAILURE');
            process.exit(1);
        }
    } catch (error) {
        log(`[ERROR] Test crashed: ${error.message}`);
        process.exit(1);
    } finally {
        fs.writeFileSync(logFile, results.join('\n'));
        log(`Results saved to ${logFile}`);
    }
}

runTest();
