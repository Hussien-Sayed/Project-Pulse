import ipcHandlers from '../../src/main/ipcHandlers.js';
import fs from 'fs';

async function runTest() {
    const results = [];
    const logFile = 'test/main/ipcHandlers_test_results.txt';
    
    if (!fs.existsSync('test/main')) {
        fs.mkdirSync('test/main', { recursive: true });
    }

    function log(message) {
        console.log(message);
        results.push(message);
    }

    log('--- Starting ipcHandlers_test ---');
    
    try {
        let passed = true;

        const registeredChannels = [];
        const mockIpcMain = {
            handle: (channel) => registeredChannels.push(channel)
        };

        const mockServices = {
            trackerController: {},
            reportService: {}
        };

        // 1. Test registration
        ipcHandlers.register(mockIpcMain, mockServices);

        const expectedChannels = [
            'tracker:start', 'tracker:pause', 'tracker:resume', 'tracker:stop', 'tracker:current',
            'sessions:getAll', 'sessions:report', 'sessions:summary',
            'window:open-dashboard'
        ];

        const missing = expectedChannels.filter(c => !registeredChannels.includes(c));
        
        if (missing.length === 0) {
            log('[PASS] register: all expected channels registered');
        } else {
            log(`[FAIL] register: missing channels ${missing.join(', ')}`);
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
