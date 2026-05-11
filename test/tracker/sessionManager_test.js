import SessionManager from '../../src/tracker/sessionManager.js';
import fs from 'fs';

async function runTest() {
    const results = [];
    const logFile = 'test/tracker/sessionManager_test_results.txt';
    
    if (!fs.existsSync('test/tracker')) {
        fs.mkdirSync('test/tracker', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting sessionManager_test ---');
    
    try {
        let passed = true;
        const sm = new SessionManager();

        // 1. Create session
        sm.createSession('Test Project');
        let session = sm.serializeSession();
        
        if (session.title === 'Test Project' && session.status === 'running' && session.sessionId) {
            log('[PASS] createSession: initialized correctly');
        } else {
            log(`[FAIL] createSession: ${JSON.stringify(session)}`);
            passed = false;
        }

        // 2. Test pause (simulate 100ms passing)
        const start = Date.now();
        while (Date.now() - start < 100); // spin-wait for 100ms
        
        sm.pause();
        session = sm.serializeSession();
        const elapsed = session.elapsedMs;
        
        if (session.status === 'paused' && elapsed >= 100) {
            log(`[PASS] pause: status is paused, elapsedMs is ${elapsed}`);
        } else {
            log(`[FAIL] pause: status=${session.status}, elapsedMs=${elapsed}`);
            passed = false;
        }

        // 3. Test resume (simulate 100ms idle)
        const pauseStart = Date.now();
        while (Date.now() - pauseStart < 100);
        
        sm.resume();
        session = sm.serializeSession();
        
        if (session.status === 'running') {
            log('[PASS] resume: status is running');
        } else {
            log(`[FAIL] resume: status=${session.status}`);
            passed = false;
        }

        // 4. Test stop
        const resumeStart = Date.now();
        while (Date.now() - resumeStart < 100);
        
        sm.stop();
        session = sm.serializeSession();
        const finalElapsed = session.elapsedMs;

        if (session.status === 'stopped' && finalElapsed >= 200) {
            log(`[PASS] stop: status is stopped, finalElapsedMs is ${finalElapsed}`);
        } else {
            log(`[FAIL] stop: status=${session.status}, finalElapsedMs=${finalElapsed}`);
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
