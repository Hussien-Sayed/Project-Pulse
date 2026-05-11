import * as constants from '../../src/config/constants.js';
import fs from 'fs';
import path from 'path';

async function runTest() {
    const results = [];
    const logFile = 'test/config/constants_test_results.txt';
    
    // Ensure test directory exists
    if (!fs.existsSync('test/config')) {
        fs.mkdirSync('test/config', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting constants_test ---');
    log(`Input: src/config/constants.js`);

    try {
        const expected = {
            IDLE_THRESHOLD_MS: 60000,
            TICK_INTERVAL_MS: 1000,
            DB_FILE_NAME: 'sessions.db',
            TRACKER_WINDOW_SIZE: { width: 320, height: 240 },
            DASHBOARD_WINDOW_SIZE: { width: 1100, height: 750 }
        };

        let passed = true;

        for (const key in expected) {
            const actual = constants[key];
            const expectedVal = expected[key];
            
            if (typeof expectedVal === 'object') {
                if (JSON.stringify(actual) === JSON.stringify(expectedVal)) {
                    log(`[PASS] ${key}: matched ${JSON.stringify(actual)}`);
                } else {
                    log(`[FAIL] ${key}: expected ${JSON.stringify(expectedVal)}, got ${JSON.stringify(actual)}`);
                    passed = false;
                }
            } else {
                if (actual === expectedVal) {
                    log(`[PASS] ${key}: matched ${actual}`);
                } else {
                    log(`[FAIL] ${key}: expected ${expectedVal}, got ${actual}`);
                    passed = false;
                }
            }
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
