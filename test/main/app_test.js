import { initApp } from '../../src/main/app.js';
import fs from 'fs';

async function runTest() {
    const results = [];
    const logFile = 'test/main/app_test_results.txt';
    
    if (!fs.existsSync('test/main')) {
        fs.mkdirSync('test/main', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting app_test ---');
    
    try {
        let passed = true;

        const services = await initApp();

        if (services && services.trackerController && services.reportService) {
            log('[PASS] initApp: returned all core services');
        } else {
            log('[FAIL] initApp: missing services in return object');
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
