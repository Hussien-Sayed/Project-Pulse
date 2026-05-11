import trackerController from '../../src/tracker/trackerController.js';
import sessionRepository from '../../src/storage/sessionRepository.js';
import database from '../../src/storage/database.js';
import eventBus from '../../src/utils/eventBus.js';
import fs from 'fs';

async function runTest() {
    const results = [];
    const logFile = 'test/tracker/trackerController_test_results.txt';
    
    if (!fs.existsSync('test/tracker')) {
        fs.mkdirSync('test/tracker', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting trackerController_test ---');
    
    try {
        let passed = true;
        database.connect();
        database.initSchema();

        let tickCount = 0;
        eventBus.on('tracker:tick', () => tickCount++);

        // 1. Test startSession
        log('Starting session...');
        const session = trackerController.startSession('Integration Test');
        
        if (session && session.title === 'Integration Test' && session.status === 'running') {
            log('[PASS] startSession: session initialized and running');
        } else {
            log(`[FAIL] startSession: ${JSON.stringify(session)}`);
            passed = false;
        }

        // Verify DB entry
        const dbRow = sessionRepository.findById(session.sessionId);
        if (dbRow && dbRow.title === 'Integration Test') {
            log('[PASS] DB: initial session record created');
        } else {
            log('[FAIL] DB: initial session record missing');
            passed = false;
        }

        // 2. Test tick emission (wait > 1s)
        log('Waiting for tick...');
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        if (tickCount > 0) {
            log(`[PASS] eventBus: received ${tickCount} tick(s)`);
        } else {
            log('[FAIL] eventBus: no ticks received');
            passed = false;
        }

        // 3. Test pause
        log('Pausing session...');
        trackerController.pauseSession();
        const pausedSession = trackerController.getCurrentSession();
        
        if (pausedSession.status === 'paused') {
            log('[PASS] pauseSession: status updated');
        } else {
            log('[FAIL] pauseSession: status not updated');
            passed = false;
        }

        // 4. Test stop
        log('Stopping session...');
        trackerController.stopSession();
        const stoppedSession = trackerController.getCurrentSession();
        
        if (stoppedSession.status === 'stopped') {
            log('[PASS] stopSession: status updated');
        } else {
            log('[FAIL] stopSession: status not updated');
            passed = false;
        }

        // Final DB check
        const finalDbRow = sessionRepository.findById(session.sessionId);
        if (finalDbRow && finalDbRow.status === 'stopped') {
            log('[PASS] DB: session record finalized');
        } else {
            log('[FAIL] DB: session record not finalized');
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
        // Cleanup interval if test crashes
        trackerController.stopSession();
    }
}

runTest();
