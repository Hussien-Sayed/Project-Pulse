import ActivityMonitor from '../../src/tracker/activityMonitor.js';
import eventBus from '../../src/utils/eventBus.js';
import fs from 'fs';

async function runTest() {
    const results = [];
    const logFile = 'test/tracker/activityMonitor_test_results.txt';
    
    if (!fs.existsSync('test/tracker')) {
        fs.mkdirSync('test/tracker', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting activityMonitor_test ---');
    
    try {
        let passed = true;
        const am = new ActivityMonitor();

        let activityEventCount = 0;
        eventBus.on('activity', () => activityEventCount++);

        // 1. Test record when not monitoring
        am.recordClick();
        if (am.clickCount === 0) {
            log('[PASS] recordClick: ignored while not monitoring');
        } else {
            log('[FAIL] recordClick: counted even when not monitoring');
            passed = false;
        }

        // 2. Test record when monitoring
        am.startMonitoring();
        am.recordClick();
        am.recordKeystroke();
        am.recordKeystroke();

        const metrics = am.getActivityMetrics();
        if (metrics.clickCount === 1 && metrics.keystrokeCount === 2) {
            log(`[PASS] getActivityMetrics: correct counts (clicks: ${metrics.clickCount}, keys: ${metrics.keystrokeCount})`);
        } else {
            log(`[FAIL] getActivityMetrics: incorrect counts ${JSON.stringify(metrics)}`);
            passed = false;
        }

        if (activityEventCount === 3) {
            log('[PASS] eventBus: emitted activity event for each record');
        } else {
            log(`[FAIL] eventBus: emitted ${activityEventCount} times (expected 3)`);
            passed = false;
        }

        // 3. Test reset
        am.resetCounters();
        if (am.clickCount === 0 && am.keystrokeCount === 0) {
            log('[PASS] resetCounters: reset to zero');
        } else {
            log('[FAIL] resetCounters: failed to reset');
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
