# Project Pulse — Productivity Manager

A premium, state-of-the-art Electron application for tracking time and productivity with real-time analytics and a sleek dark-mode interface.

## 🚀 Getting Started

### Prerequisites
Ensure you have Node.js installed. If you encounter errors related to `better-sqlite3`, you may need to rebuild native modules for your specific Electron version:
```bash
npx electron-rebuild
```

### Development Workflow
To run the app in development mode with Hot Module Replacement (HMR), you currently need to use two terminal windows:

**Terminal 1 (UI Dev Server):**
```bash
npm run dev
```

**Terminal 2 (Electron App):**
```bash
npm start
```

---

## 🏗️ Building for Production

When you are ready to create a production-ready version of the app:

1.  **Build the UI Assets:**
    ```bash
    npm run build
    ```
    This transpiles the React code and generates optimized static files in the `dist/` directory.

2.  **Run in Production Mode:**
    Set your environment to production in `.env`:
    ```env
    NODE_ENV=production
    ```
    Then run `npm start`. The app will automatically switch from loading the localhost URL to loading the local built files in `dist/`.

3.  **Packaging (Optional):**
    To create a standalone `.exe` or `.app` installer, you can add `electron-builder` to the project:
    ```bash
    npm install electron-builder --save-dev
    npx electron-builder
    ```

---

## 🛠️ Tech Stack
- **Core**: Electron, Node.js
- **Frontend**: React 18, Vite
- **Database**: SQLite (via better-sqlite3)
- **Styling**: Vanilla CSS with HSL variables and Glassmorphism
- **State Management**: React Hooks + Electron IPC Bridge
