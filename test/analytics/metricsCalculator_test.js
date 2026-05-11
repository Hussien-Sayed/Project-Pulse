import * as metrics from '../../src/analytics/metricsCalculator.js';
import fs from 'fs';

async function runTest() {
    const results = [];
    const logFile = 'test/analytics/metricsCalculator_test_results.txt';
    
    if (!fs.existsSync('test/analytics')) {
        fs.mkdirSync('test/analytics', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting metricsCalculator_test ---');
    
    try {
        let passed = true;

        const mockSession = {
            click_count: 50,
            keystroke_count: 150,
            elapsed_ms: 600000, // 10 minutes
            idle_ms: 60000      // 1 minute
        };

        log(`Input Session: ${JSON.stringify(mockSession)}`);

        // 1. Test Activity Rate
        // (50 + 150) / 10 = 20 events per minute
        const rate = metrics.calculateActivityRate(mockSession);
        if (rate === 20) {
            log(`[PASS] activityRate: ${rate}`);
        } else {
            log(`[FAIL] activityRate: expected 20, got ${rate}`);
            passed = false;
        }

        // 2. Test Idle Percentage
        // (60000 / 600000) * 100 = 10%
        const idle = metrics.calculateIdlePercentage(mockSession);
        if (idle === 10) {
            log(`[PASS] idlePercentage: ${idle}%`);
        } else {
            log(`[FAIL] idlePercentage: expected 10, got ${idle}`);
            passed = false;
        }

        // 3. Test Productivity Score
        // 100 - 10 + (20 * 2) = 130 -> clamped to 100
        const score = metrics.calculateProductivityScore(mockSession);
        if (score === 100) {
            log(`[PASS] productivityScore: ${score}`);
        } else {
            log(`[FAIL] productivityScore: expected 100, got ${score}`);
            passed = false;
        }

        // 4. Test with Zero Elapsed
        const zeroSession = { elapsed_ms: 0 };
        const zeroScore = metrics.calculateProductivityScore(zeroSession);
        if (zeroScore === 100) { // 100 - 0 + 0
             log(`[PASS] zeroSessionScore: ${zeroScore}`);
        } else {
             log(`[FAIL] zeroSessionScore: expected 100, got ${zeroScore}`);
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
