import sessionRepository from '../../src/storage/sessionRepository.js';
import database from '../../src/storage/database.js';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

async function runTest() {
    const results = [];
    const logFile = 'test/storage/sessionRepository_test_results.txt';
    
    if (!fs.existsSync('test/storage')) {
        fs.mkdirSync('test/storage', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting sessionRepository_test ---');
    
    try {
        let passed = true;
        database.connect();
        database.initSchema();

        const testId = uuidv4();
        const testData = {
            id: testId,
            title: 'Repository Test Session',
            status: 'stopped',
            start_time: Date.now() - 10000,
            created_at: Date.now(),
            elapsed_ms: 10000,
            idle_ms: 1000,
            click_count: 5,
            keystroke_count: 50
        };

        // 1. Test create
        const created = sessionRepository.create(testData);
        if (created && created.id === testId) {
            log('[PASS] create: row inserted and retrieved');
        } else {
            log(`[FAIL] create: expected ${testId}, got ${created?.id}`);
            passed = false;
        }

        // 2. Test update
        sessionRepository.update(testId, { title: 'Updated Title', elapsed_ms: 20000 });
        const updated = sessionRepository.findById(testId);
        if (updated && updated.title === 'Updated Title' && updated.elapsed_ms === 20000) {
            log('[PASS] update: fields modified correctly');
        } else {
            log(`[FAIL] update: ${JSON.stringify(updated)}`);
            passed = false;
        }

        // 3. Test findAll
        const all = sessionRepository.findAll();
        if (all.length > 0 && all.some(s => s.id === testId)) {
            log(`[PASS] findAll: retrieved ${all.length} sessions including test session`);
        } else {
            log('[FAIL] findAll: test session missing in results');
            passed = false;
        }

        // 4. Test delete
        sessionRepository.deleteById(testId);
        const deleted = sessionRepository.findById(testId);
        if (!deleted) {
            log('[PASS] deleteById: row removed');
        } else {
            log('[FAIL] deleteById: row still exists');
            passed = false;
        }

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
