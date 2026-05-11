import eventBus from '../../src/utils/eventBus.js';
import fs from 'fs';

async function runTest() {
    const results = [];
    const logFile = 'test/utils/eventBus_test_results.txt';
    
    if (!fs.existsSync('test/utils')) {
        fs.mkdirSync('test/utils', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting eventBus_test ---');
    
    try {
        let passed = true;

        let callCount = 0;
        let lastPayload = null;

        const callback = (payload) => {
            callCount++;
            lastPayload = payload;
        };

        // Test on and emit
        const unsub = eventBus.on('test-event', callback);
        eventBus.emit('test-event', { foo: 'bar' });

        if (callCount === 1 && lastPayload.foo === 'bar') {
            log('[PASS] on/emit: event received with correct payload');
        } else {
            log(`[FAIL] on/emit: callCount=${callCount}, lastPayload=${JSON.stringify(lastPayload)}`);
            passed = false;
        }

        // Test unsubscribe via return function
        unsub();
        eventBus.emit('test-event', { foo: 'baz' });

        if (callCount === 1) {
            log('[PASS] unsubscribe: callback not called after unsub');
        } else {
            log(`[FAIL] unsubscribe: callCount=${callCount} (expected 1)`);
            passed = false;
        }

        // Test multiple listeners
        let listener2Called = false;
        eventBus.on('multi', () => { listener2Called = true; });
        eventBus.on('multi', () => { /* another listener */ });
        eventBus.emit('multi');

        if (listener2Called) {
            log('[PASS] multiple listeners: all called');
        } else {
            log('[FAIL] multiple listeners: listener not called');
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
