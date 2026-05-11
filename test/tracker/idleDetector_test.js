import IdleDetector from '../../src/tracker/idleDetector.js';
import eventBus from '../../src/utils/eventBus.js';
import fs from 'fs';

async function runTest() {
    const results = [];
    const logFile = 'test/tracker/idleDetector_test_results.txt';
    
    if (!fs.existsSync('test/tracker')) {
        fs.mkdirSync('test/tracker', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting idleDetector_test ---');
    
    try {
        let passed = true;
        // Use a short threshold for testing: 100ms
        const detector = new IdleDetector(100);

        let idleStarted = false;
        let idleEnded = false;

        eventBus.on('idle:start', () => idleStarted = true);
        eventBus.on('idle:end', () => idleEnded = true);

        // 1. Start detector
        detector.start();
        log('Detector started with 100ms threshold');

        // 2. Wait for idle
        const start = Date.now();
        while (Date.now() - start < 200); // spin-wait 200ms
        
        detector._checkIdle(); // Manual trigger since interval is 5s
        
        if (detector.isIdle() && idleStarted) {
            log('[PASS] _checkIdle: detected idleness');
        } else {
            log(`[FAIL] _checkIdle: isIdle=${detector.isIdle()}, idleStarted=${idleStarted}`);
            passed = false;
        }

        // 3. Update activity to end idle
        detector.updateActivity(Date.now());
        
        if (!detector.isIdle() && idleEnded) {
            log('[PASS] updateActivity: resumed from idle');
        } else {
            log(`[FAIL] updateActivity: isIdle=${detector.isIdle()}, idleEnded=${idleEnded}`);
            passed = false;
        }

        const idleMs = detector.getIdleMs();
        if (idleMs >= 200) {
            log(`[PASS] getIdleMs: accumulated ${idleMs}ms`);
        } else {
            log(`[FAIL] getIdleMs: accumulated ${idleMs}ms (expected >= 200)`);
            passed = false;
        }

        detector.stop();

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
