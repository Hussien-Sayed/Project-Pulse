
# Productivity Manager — Project Tree
# Upwork-style time tracker (Electron + Node.js + React)
# ─────────────────────────────────────────────────────────────────────────────
# Architecture Overview
# ─────────────────────────────────────────────────────────────────────────────
# MAIN PROCESS  → electron/main.js (app lifecycle + IPC server)
#                 ├─ src/main/windowManager.js  (window creation/control)
#                 ├─ src/tracker/*              (tracking domain logic)
#                 ├─ src/storage/*              (DB access)
#                 └─ src/analytics/*            (metric computation)
#
# IPC BRIDGE    → electron/preload.js           (contextBridge — secure API surface)
#               → src/main/ipcHandlers.js       (main-side IPC handler registry)
#
# RENDERER      → src/ui/renderer.js            (React mount root per window)
#                 ├─ src/ui/windows/TrackerApp.jsx
#                 └─ src/ui/windows/DashboardApp.jsx
# ─────────────────────────────────────────────────────────────────────────────

- electron
    - main.js
        * purpose: Electron entry point — app lifecycle, window creation, IPC setup
        * input: Electron app events (ready, window-all-closed, activate)
        * output: app windows initialized; IPC handlers registered
        * NOTE: delegates window creation to windowManager, IPC routing to ipcHandlers

        * methods:
            - onAppReady()
                → calls windowManager.createTrackerWindow()
                → calls ipcHandlers.register(ipcMain)
            - onWindowAllClosed()
            - onActivate()

    - preload.js
        * purpose: expose a safe, explicit API surface to renderer via contextBridge
        * input: calls from renderer JS
        * output: invokes ipcRenderer.invoke / ipcRenderer.on to relay to main process
        * SECURITY: no Node.js APIs exposed directly — only the listed methods

        * exposed API (window.electronAPI):
            - startTracking(title)         → ipcRenderer.invoke('tracker:start', title)
            - pauseTracking()              → ipcRenderer.invoke('tracker:pause')
            - resumeTracking()             → ipcRenderer.invoke('tracker:resume')
            - stopTracking()               → ipcRenderer.invoke('tracker:stop')
            - getCurrentSession()          → ipcRenderer.invoke('tracker:current')
            - getSessions()                → ipcRenderer.invoke('sessions:getAll')
            - getSessionReport(sessionId)  → ipcRenderer.invoke('sessions:report', sessionId)
            - getAllSummary()              → ipcRenderer.invoke('sessions:summary')
            - openDashboard()              → ipcRenderer.invoke('window:open-dashboard')
            - onTickUpdate(callback)       → ipcRenderer.on('tracker:tick', callback)

- src
    - main
        - windowManager.js
            * purpose: create and manage Electron BrowserWindow instances
            * input: window config (width, height, preload path, html path)
            * output: BrowserWindow references stored internally

            * methods:
                - createTrackerWindow()
                    → creates small floating window (e.g. 300×200)
                    → loads tracker.html
                    → returns BrowserWindow ref
                - createDashboardWindow()
                    → creates larger window (e.g. 1024×768)
                    → loads dashboard.html
                    → returns BrowserWindow ref
                - getTrackerWindow()
                - getDashboardWindow()
                - closeWindow(name)         ← name: 'tracker' | 'dashboard'
                - toggleWindow(name)

        - ipcHandlers.js
            * purpose: register all ipcMain handlers; bridge renderer calls to domain logic
            * input: ipcMain instance, initialized services (trackerController, reportService)
            * output: handlers registered on ipcMain channels
            * NOTE: this is the ONLY place ipcMain.handle() is called

            * methods:
                - register(ipcMain, { trackerController, reportService })
                    → ipcMain.handle('tracker:start',   (_, title) => trackerController.startSession(title))
                    → ipcMain.handle('tracker:pause',   ()         => trackerController.pauseSession())
                    → ipcMain.handle('tracker:resume',  ()         => trackerController.resumeSession())
                    → ipcMain.handle('tracker:stop',    ()         => trackerController.stopSession())
                    → ipcMain.handle('tracker:current', ()         => trackerController.getCurrentSession())
                    → ipcMain.handle('sessions:getAll', ()         => reportService.getAllSessionsSummary())
                    → ipcMain.handle('sessions:report', (_, id)    => reportService.getSessionReport(id))
                    → ipcMain.handle('sessions:summary',()         => reportService.getAllSessionsSummary())
                    → ipcMain.handle('window:open-dashboard', ()   => windowManager.createDashboardWindow())

                - forwardEvents(windowManager, eventBus)
                    → listens to eventBus.on('tracker:tick') 
                    → calls windowManager.getTrackerWindow().webContents.send('tracker:tick', data)

        - app.js
            * purpose: initialize all services and wire dependencies; called by electron/main.js
            * input: config from src/config/env.js
            * output: initialized { trackerController, reportService } returned for IPC wiring

            * methods:
                - async initApp()
                    → database.connect()
                    → database.initSchema()
                    → returns { trackerController, reportService }

    - tracker
        - trackerController.js
            * purpose: central orchestrator for a tracking session lifecycle
            * input: user commands (start/pause/resume/stop), session title
            * output: updated session state; side effects: saves to DB, emits tick events
            * dependencies: SessionManager, ActivityMonitor, IdleDetector, SessionRepository, eventBus

            * methods:
                - startSession(title)
                    → validates no active session
                    → creates new SessionManager instance
                    → starts ActivityMonitor
                    → starts IdleDetector
                    → starts tick interval (emits 'tracker:tick' every 1s via eventBus)
                    → calls sessionRepository.create(initialData)
                - pauseSession()
                    → sessionManager.pause()
                    → activityMonitor.stopMonitoring()
                    → idleDetector.stop()
                    → clears tick interval
                - resumeSession()
                    → sessionManager.resume()
                    → activityMonitor.startMonitoring()
                    → idleDetector.start()
                    → restarts tick interval
                - stopSession()
                    → sessionManager.stop()
                    → activityMonitor.stopMonitoring()
                    → idleDetector.stop()
                    → clears tick interval
                    → builds final session payload → sessionRepository.update(sessionId, payload)
                - getCurrentSession()
                    → returns sessionManager.serializeSession() merged with activityMonitor.getActivityMetrics()

        - sessionManager.js
            * purpose: manage elapsed time for a single tracking session
            * input: session title
            * output: session object with title, startTime, elapsedMs, status
            * NOTE: pure time logic only — no DB calls, no activity tracking

            * class: SessionManager
                - properties:
                    - sessionId       (uuid)
                    - title           (string)
                    - status          ('idle' | 'running' | 'paused' | 'stopped')
                    - startTime       (Date)
                    - pausedAt        (Date | null)
                    - elapsedMs       (number, accumulated across pause/resume cycles)

                - methods:
                    - createSession(title)   → sets sessionId, title, status='running', startTime=now
                    - pause()                → records pausedAt; status='paused'
                    - resume()               → adds paused gap to elapsedMs; status='running'
                    - stop()                 → finalizes elapsedMs; status='stopped'
                    - getElapsedMs()         → returns elapsedMs + (now - startTime) if running
                    - serializeSession()     → returns plain object { sessionId, title, status, startTime, elapsedMs }

        - activityMonitor.js
            * purpose: track user input events (mouse clicks, keystrokes) during a session
            * input: system-level input events via iohook or electron globalShortcut
            * output: click count, keystroke count; emits 'activity' event via eventBus on each event
            * NOTE: emitting 'activity' is what IdleDetector listens to for resetting idle timer

            * class: ActivityMonitor
                - properties:
                    - clickCount      (number)
                    - keystrokeCount  (number)
                    - _listeners      (internal event handler refs for cleanup)

                - methods:
                    - startMonitoring()
                        → registers global mouse/keyboard listeners
                        → on each event: increments counter + eventBus.emit('activity', timestamp)
                    - stopMonitoring()
                        → removes all registered listeners
                    - resetCounters()
                        → clickCount = 0; keystrokeCount = 0
                    - getActivityMetrics()
                        → returns { clickCount, keystrokeCount }

        - idleDetector.js
            * purpose: detect continuous inactivity and accumulate total idle time
            * input: 'activity' events from eventBus (emitted by ActivityMonitor)
            * output: idle duration in ms; emits 'idle:start' and 'idle:end' events via eventBus
            * NOTE: listens to eventBus 'activity' — no direct dependency on ActivityMonitor class

            * class: IdleDetector
                - properties:
                    - idleThresholdMs    (number, default: 60000 = 1 min)
                    - lastActivityAt     (Date)
                    - totalIdleMs        (number, accumulated)
                    - _checkInterval     (timer ref)
                    - _isIdle            (boolean)

                - methods:
                    - start()
                        → sets lastActivityAt = now
                        → subscribes to eventBus 'activity' → calls updateActivity()
                        → starts _checkInterval polling every 5s → calls _checkIdle()
                    - stop()
                        → clears _checkInterval
                        → unsubscribes from eventBus 'activity'
                        → if _isIdle: finalizes current idle period into totalIdleMs
                    - updateActivity(timestamp)
                        → lastActivityAt = timestamp
                        → if _isIdle: ends idle period, accumulates gap into totalIdleMs, _isIdle=false
                    - _checkIdle()
                        → if (now - lastActivityAt) > idleThresholdMs and not _isIdle:
                            → _isIdle = true; eventBus.emit('idle:start')
                    - isIdle()           → returns _isIdle
                    - getIdleMs()        → returns totalIdleMs + (current idle period if active)

    - storage
        - database.js
            * purpose: open SQLite connection and initialize schema on first run
            * input: dbPath from config/env.js
            * output: exports `db` — the active better-sqlite3 database instance
            * dependency: better-sqlite3

            * schema (tables created by initSchema):
                TABLE sessions:
                    - id          TEXT PRIMARY KEY   (uuid)
                    - title       TEXT NOT NULL
                    - status      TEXT               ('running'|'paused'|'stopped')
                    - start_time  INTEGER            (Unix ms)
                    - end_time    INTEGER            (Unix ms, nullable)
                    - elapsed_ms  INTEGER            (total tracked ms)
                    - idle_ms     INTEGER            (total idle ms within session)
                    - click_count INTEGER
                    - keystroke_count INTEGER
                    - created_at  INTEGER            (Unix ms)

            * methods:
                - connect()         → opens DB file at dbPath; returns db instance
                - initSchema()      → runs CREATE TABLE IF NOT EXISTS for all tables

        - sessionRepository.js
            * purpose: CRUD operations on the sessions table
            * input: session data objects, query filters
            * output: stored or retrieved session records (plain objects)
            * dependency: database.js (db instance)

            * class: SessionRepository
                - methods:
                    - create(sessionData)
                        → INSERT INTO sessions; returns inserted row
                    - update(sessionId, data)
                        → UPDATE sessions SET ... WHERE id = sessionId
                    - findById(sessionId)
                        → SELECT * FROM sessions WHERE id = ?
                    - findAll({ limit, offset, dateFrom, dateTo } = {})
                        → SELECT with optional WHERE created_at BETWEEN filters
                    - deleteById(sessionId)
                        → DELETE FROM sessions WHERE id = ?

    - analytics
        - metricsCalculator.js
            * purpose: compute derived productivity metrics from a raw session record
            * input: session record (plain object from sessionRepository)
            * output: computed metrics object
            * NOTE: pure functions — no DB access, no side effects

            * methods:
                - calculateActivityRate(session)
                    → (clickCount + keystrokeCount) / (elapsedMs / 60000)  [events per minute]
                - calculateIdlePercentage(session)
                    → (idleMs / elapsedMs) * 100
                - calculateProductivityScore(session)
                    → weighted formula: 100 - idlePercentage + activityRate factor (clamped 0–100)

        - reportService.js
            * purpose: compose analytics results for the UI; the single analytics entry point
            * input: sessionId or no args
            * output: formatted report objects ready for renderer consumption
            * dependencies: sessionRepository (reads data), metricsCalculator (computes metrics)

            * methods:
                - async getSessionReport(sessionId)
                    → session = sessionRepository.findById(sessionId)
                    → metrics = metricsCalculator.calculateAll(session)
                    → returns { session, metrics }
                - async getAllSessionsSummary()
                    → sessions = sessionRepository.findAll()
                    → returns sessions mapped with basic metrics (idlePercentage, activityRate)
                - groupSessionsByDate(sessions)
                    → groups session array by YYYY-MM-DD date key

    - ui
        - tracker.html
            * purpose: HTML shell for the tracker window renderer process
            * input: none (loaded by windowManager.createTrackerWindow)
            * output: mounts TrackerApp React component

        - dashboard.html
            * purpose: HTML shell for the dashboard window renderer process
            * input: none (loaded by windowManager.createDashboardWindow)
            * output: mounts DashboardApp React component

        - renderer
            - trackerRenderer.js
                * purpose: React mount root for tracker window
                * input: DOM element #root in tracker.html
                * output: renders <TrackerApp />

            - dashboardRenderer.js
                * purpose: React mount root for dashboard window
                * input: DOM element #root in dashboard.html
                * output: renders <DashboardApp />

        - styles
            - index.css
                * purpose: global resets, typography, and foundational layout rules
            - theme.css
                * purpose: design system tokens (CSS variables for colors, shadows, animations)
                * NOTE: implements the "Premium" dark mode and vibrant accent colors

        - windows
            - TrackerApp.jsx
                * purpose: root component for the floating tracker window
                * input: electronAPI from window (via preload)
                * output: renders SessionInput + TimerControls + live timer display
                * state: { title, status, elapsedMs, clickCount, keystrokeCount }

                * methods:
                    - handleStart()   → electronAPI.startTracking(title)
                    - handlePause()   → electronAPI.pauseTracking()
                    - handleResume()  → electronAPI.resumeTracking()
                    - handleStop()    → electronAPI.stopTracking()
                    - handleOpenDashboard() → electronAPI.openDashboard()
                    - onTick(data)    → updates elapsedMs, clickCount, keystrokeCount from tick payload

            - DashboardApp.jsx
                * purpose: root component for the sessions dashboard window
                * input: electronAPI from window (via preload)
                * output: renders SessionList + SessionDetail with metrics/charts
                * state: { sessions, selectedSession, report }

                * methods:
                    - loadSessions()         → electronAPI.getSessions()
                    - loadReport(sessionId)  → electronAPI.getSessionReport(sessionId)
                    - groupByDate()          → groups sessions for date-based display

        - components
            - TimerControls.jsx
                * purpose: start / pause / resume / stop button group
                * input props: status ('idle'|'running'|'paused'), onStart, onPause, onResume, onStop, onOpenHistory
                * output: renders correct buttons based on status + a separate "History" icon/button
                * NOTE: resume button appears only when status === 'paused'
                * NOTE: History button is always accessible to view past records

            - SessionInput.jsx
                * purpose: controlled text input for session title
                * input props: value, onChange, disabled (true when status !== 'idle')
                * output: renders labeled text field; disabled while session is active

            - LiveTimer.jsx
                * purpose: display formatted elapsed time, updating each tick
                * input props: elapsedMs (number)
                * output: renders HH:MM:SS string via timeUtils.formatDuration

            - ActivityBadge.jsx
                * purpose: display real-time activity counts during tracking
                * input props: clickCount, keystrokeCount
                * output: renders click icon + count, keyboard icon + count

            - SessionList.jsx
                * purpose: scrollable list of past sessions for dashboard
                * input props: sessions (array), onSelect (callback)
                * output: renders session rows with title, date, duration, productivityScore

            - SessionDetail.jsx
                * purpose: detailed view of a single session with metrics breakdown
                * input props: report ({ session, metrics })
                * output: renders duration, idle%, activity rate, productivity score, timestamps

    - utils
        - timeUtils.js
            * purpose: time calculation and formatting helpers
            * input: timestamps (ms), duration (ms)
            * output: formatted strings or computed numbers

            * methods:
                - formatDuration(ms)              → 'HH:MM:SS'
                - getCurrentTimestamp()            → Date.now()
                - calculateDifference(start, end)  → end - start (ms)
                - toDateString(timestamp)          → 'YYYY-MM-DD'

        - eventBus.js
            * purpose: lightweight in-process pub/sub for decoupled communication
            * input: event name (string), payload (any)
            * output: invokes all registered listeners synchronously
            * NOTE: used only in main process — NOT shared with renderer

            * methods:
                - emit(event, payload)
                - on(event, callback)    → returns unsubscribe function
                - off(event, callback)

    - config
        - constants.js
            * purpose: static configuration constants
            * exports:
                - IDLE_THRESHOLD_MS     = 60_000   (1 minute)
                - TICK_INTERVAL_MS      = 1_000    (1 second)
                - DB_FILE_NAME          = 'sessions.db'
                - TRACKER_WINDOW_SIZE   = { width: 320, height: 240 }
                - DASHBOARD_WINDOW_SIZE = { width: 1100, height: 750 }

        - env.js
            * purpose: load and validate environment variables from .env
            * input: process.env (populated by dotenv)
            * output: typed config object

            * exports:
                - DB_PATH   (string, absolute path to data/sessions.db)
                - NODE_ENV  (string, 'development' | 'production')

- data
    - sessions.db
        * purpose: SQLite database file — persistent storage
        * created automatically by database.js on first run
        * managed exclusively through sessionRepository.js

- package.json
    * purpose: project metadata, dependencies, and npm scripts
    * key dependencies:
        - electron
        - react, react-dom
        - better-sqlite3
        - uuid
        - dotenv
    * key devDependencies:
        - @electron-forge/cli (or electron-builder)
        - @babel/core, @babel/preset-react (for JSX transpilation)
        - webpack or vite (renderer bundling)
    * scripts:
        - start   → electron .
        - dev     → runs renderer dev server + electron concurrently
        - build   → bundles renderer + packages electron app
        - test    → runs all test suites

- .env
    * purpose: local environment configuration (not committed to git)
    * keys:
        - DB_PATH=./data/sessions.db
        - NODE_ENV=development

- .env.example
    * purpose: template showing required env keys (committed to git)
    * keys:
        - DB_PATH=./data/sessions.db
        - NODE_ENV=development