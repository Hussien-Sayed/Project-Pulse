import * as env from '../../src/config/env.js';
import fs from 'fs';
import path from 'path';

async function runTest() {
    const results = [];
    const logFile = 'test/config/env_test_results.txt';
    
    if (!fs.existsSync('test/config')) {
        fs.mkdirSync('test/config', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting env_test ---');
    
    try {
        let passed = true;

        log(`DB_PATH: ${env.DB_PATH}`);
        log(`NODE_ENV: ${env.NODE_ENV}`);

        if (env.DB_PATH && path.isAbsolute(env.DB_PATH)) {
            log('[PASS] DB_PATH: resolved to absolute path');
        } else {
            log(`[FAIL] DB_PATH: ${env.DB_PATH}`);
            passed = false;
        }

        if (env.NODE_ENV === 'development') {
            log('[PASS] NODE_ENV: matched default development');
        } else {
            log(`[NOTE] NODE_ENV is ${env.NODE_ENV}`);
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
