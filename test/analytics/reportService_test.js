import reportService from '../../src/analytics/reportService.js';
import sessionRepository from '../../src/storage/sessionRepository.js';
import database from '../../src/storage/database.js';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

async function runTest() {
    const results = [];
    const logFile = 'test/analytics/reportService_test_results.txt';
    
    if (!fs.existsSync('test/analytics')) {
        fs.mkdirSync('test/analytics', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting reportService_test ---');
    
    try {
        let passed = true;
        database.connect();
        database.initSchema();

        const testId = uuidv4();
        const testSession = {
            id: testId,
            title: 'Report Test Session',
            status: 'stopped',
            start_time: Date.now() - 3600000, // 1 hour ago
            created_at: Date.now(),
            elapsed_ms: 3600000,
            idle_ms: 360000, // 10% idle
            click_count: 100,
            keystroke_count: 500
        };

        sessionRepository.create(testSession);

        // 1. Test getSessionReport
        const report = await reportService.getSessionReport(testId);
        if (report && report.metrics.idlePercentage === 10) {
            log('[PASS] getSessionReport: retrieved session with computed metrics');
        } else {
            log(`[FAIL] getSessionReport: ${JSON.stringify(report?.metrics)}`);
            passed = false;
        }

        // 2. Test getAllSessionsSummary
        const summary = await reportService.getAllSessionsSummary();
        if (summary.length > 0 && summary[0].metrics.productivityScore !== undefined) {
            log('[PASS] getAllSessionsSummary: summary includes metrics for all rows');
        } else {
            log('[FAIL] getAllSessionsSummary: metrics missing');
            passed = false;
        }

        // 3. Test groupSessionsByDate
        const grouped = reportService.groupSessionsByDate(summary);
        const today = new Date().toISOString().split('T')[0];
        if (grouped[today] && grouped[today].length > 0) {
            log(`[PASS] groupSessionsByDate: grouped correctly under ${today}`);
        } else {
            log(`[FAIL] groupSessionsByDate: group for ${today} not found`);
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
