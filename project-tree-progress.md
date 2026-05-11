# Productivity Manager — Project Progress
# Upwork-style time tracker (Electron + Node.js + React)
# ─────────────────────────────────────────────────────────────────────────────

- [✓] package.json {1}
- [✓] .env.example {1}
- [✓] .env {1}

- electron
    - [✓] main.js {8}
    - [✓] preload.js {1}

- src
    - main
        - [✓] windowManager.js {1}
        - [✓] ipcHandlers.js {7}
        - [✓] app.js {6}

    - tracker
        - [✓] trackerController.js {5}
        - [✓] sessionManager.js {1}
        - [✓] activityMonitor.js {1}
        - [✓] idleDetector.js {2}

    - storage
        - [✓] database.js {3}
        - [✓] sessionRepository.js {4}

    - analytics
        - [✓] metricsCalculator.js {1}
        - [✓] reportService.js {5}

    - ui
        - [✓] tracker.html {1}
        - [✓] dashboard.html {1}
        - renderer
            - [✓] trackerRenderer.js {4}
            - [✓] dashboardRenderer.js {4}
        - styles
            - [✓] index.css {2}
            - [✓] theme.css {1}
        - windows
            - [✓] TrackerApp.jsx {3}
            - [✓] DashboardApp.jsx {3}
        - components
            - [✓] TimerControls.jsx {2}
            - [✓] SessionInput.jsx {2}
            - [✓] LiveTimer.jsx {2}
            - [✓] ActivityBadge.jsx {2}
            - [✓] SessionList.jsx {2}
            - [✓] SessionDetail.jsx {2}

    - utils
        - [✓] timeUtils.js {1}
        - [✓] eventBus.js {1}

    - config
        - [✓] constants.js {1}
        - [✓] env.js {2}

- data
    - sessions.db (Auto-generated)
