import * as timeUtils from '../../src/utils/timeUtils.js';
import fs from 'fs';

async function runTest() {
    const results = [];
    const logFile = 'test/utils/timeUtils_test_results.txt';
    
    if (!fs.existsSync('test/utils')) {
        fs.mkdirSync('test/utils', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting timeUtils_test ---');
    
    try {
        let passed = true;

        // Test formatDuration
        const durationCases = [
            { input: 0, expected: '00:00:00' },
            { input: 1000, expected: '00:00:01' },
            { input: 60000, expected: '00:01:00' },
            { input: 3600000, expected: '01:00:00' },
            { input: 3661000, expected: '01:01:01' }
        ];

        durationCases.forEach(c => {
            const actual = timeUtils.formatDuration(c.input);
            if (actual === c.expected) {
                log(`[PASS] formatDuration(${c.input}): ${actual}`);
            } else {
                log(`[FAIL] formatDuration(${c.input}): expected ${c.expected}, got ${actual}`);
                passed = false;
            }
        });

        // Test toDateString
        const date = new Date(2026, 4, 8); // May 8, 2026 (Month is 0-indexed)
        const dateActual = timeUtils.toDateString(date.getTime());
        const dateExpected = '2026-05-08';
        if (dateActual === dateExpected) {
            log(`[PASS] toDateString: ${dateActual}`);
        } else {
            log(`[FAIL] toDateString: expected ${dateExpected}, got ${dateActual}`);
            passed = false;
        }

        // Test calculateDifference
        const diff = timeUtils.calculateDifference(100, 250);
        if (diff === 150) {
            log(`[PASS] calculateDifference(100, 250): 150`);
        } else {
            log(`[FAIL] calculateDifference(100, 250): expected 150, got ${diff}`);
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
