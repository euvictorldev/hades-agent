<p align="center">
  <img src="https://res.cloudinary.com/dmii83n8i/image/upload/fl_preserve_transparency/v1779237561/hades-agent_cx7vq7.jpg?_s=public-apps" alt="Hades Banner" width="100%" style="border-radius: 16px; max-width: 800px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
</p>

<table>
  <tr>
    <td width="35%" align="center" valign="top">
      <img src="public/icon/icon.png" width="280" style="border-radius: 40px; border: 5px solid #ff2a2a; box-shadow: 0 15px 40px rgba(255, 42, 42, 0.4); display: block; margin-bottom: 15px;" alt="Hades Agent Logo" />
      <p align="center" style="margin-top: 10px; margin-bottom: 0;">
        <img src="https://img.shields.io/badge/License-MIT-red?style=flat-square&color=150202" alt="License" style="display: inline-block; vertical-align: middle;" />
        <img src="https://img.shields.io/badge/Electron-42.0-red?style=flat-square&logo=electron&logoColor=white&color=150202" alt="Electron" style="display: inline-block; vertical-align: middle;" />
        <img src="https://img.shields.io/badge/React-19.0-red?style=flat-square&logo=react&logoColor=61DAFB&color=150202" alt="React" style="display: inline-block; vertical-align: middle;" />
      </p>
    </td>
    <td width="65%" valign="top" style="padding-left: 20px;">
      <h1 style="margin-top: 0; margin-bottom: 8px;">Hades Agent <img src="https://res.cloudinary.com/dmii83n8i/image/upload/v1779302517/hades-tray-icon-128_dks55n.png" width="36" height="36" align="center" style="display: inline-block; vertical-align: middle; margin-left: 6px;" alt="Hades Icon" /></h1>
      <p><strong>Hades Agent is an intelligent virtual desktop assistant (Windows), built with Electron and React. It functions as a "floating widget" that offers advanced text chat and a powerful voice transcription mode with real-time insights via Gemini Live.</strong></p>
      <p><strong>Security Boundaries:</strong> Sandboxed with <strong>zero write access to the system</strong> (cannot natively create, edit, or delete local files via chat). The intelligence is entirely focused on interface support and productivity.</p>
    </td>
  </tr>
</table>

<p align="center" style="margin-top: 20px;">
  <a href="https://github.com/victorl-dev/Hades-Agent/releases"><img src="https://img.shields.io/badge/Releases-Download-FF2A2A?style=for-the-badge&logo=github" alt="Releases"></a>
  <a href="https://github.com/victorl-dev/Hades-Agent/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License: MIT"></a>
  <a href="https://github.com/victorl-dev/Hades-Agent"><img src="https://img.shields.io/badge/Built%20With-Gemini%20Live%20API-blueviolet?style=for-the-badge" alt="Built with Gemini Live"></a>
  <a href="https://github.com/victorl-dev/Hades-Agent"><img src="https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Platform: Windows"></a>
</p>

## Key Features

- **MiniChat:** A minimalist floating chat, conversing directly with the AI, designed for quick access and global shortcuts.
- **Susurro Mode (Real-Time Insights):** Much more than a simple voice recorder. By activating the "Suggestions/Insights" mode, Hades stops acting just as a transcriber and actively listens to your context. It works as a *brainstorming partner*, identifying questions, problems, or discussion topics in real time and providing ideas, quick answers, and solutions directly on the screen. The model has been strictly instructed (via `insight_rules.md`) to be concise, agile, and to hide internal monologues (CoT), delivering only the final value directly for you to read while speaking.
- **Persistent History:** The application automatically saves your text and audio sessions in the backend, generating smart titles based on the context of the conversation.
- **Overlay & Glassmorphism UI:** Premium design with fluid transparency, side menus, and high responsiveness.
- **Native Resizing:** System-level optimized window resizing loop (`requestAnimationFrame` + IPC fast-fire) for immaculate performance on Windows.

---

## Tech Stack

- **Language:** TypeScript / JavaScript (Node.js + Browser)
- **Desktop Framework:** Electron (v42+)
- **Frontend:** React 19 + Vite 8
- **Styling:** Pure Vanilla CSS with CSS Variables & Backdrop Filters
- **AI and APIs:** `@google/genai`, `@google/generative-ai`, `@google-cloud/speech`
- **Audio:** `recordrtc`
- **Packager:** `electron-builder`

---

## Prerequisites

- Node.js 20 or higher.
- NPM or pnpm.
- A valid **Google Gemini API** key.
- OS: Windows (packaging is focused on `.exe` and portable apps on Windows).

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/victorl-dev/Hades-Agent.git
cd hades-agent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the API Key

It is not necessary to create a `.env` file manually. When starting the application for the first time, you can configure your API key directly in the system interface:
1. Open the **Settings** by clicking the gear icon or pressing the global shortcut `Alt + S`.
2. Enter your **Google Gemini API** key.
3. The key will be securely encrypted and saved locally by Electron.

### 4. Run in Development Environment

The command below will start Vite (to compile React) and Electron (your native window) in parallel.

```bash
npm run dev
```

*Note: In case of residual crashes, the command automatically kills stuck 3000 ports and terminates zombie Electron processes.*

---

## Architecture

Hades Agent uses a unified Single Window architecture. The main application state toggles the internal interfaces, keeping the Electron window alive and resizing accordingly.

### Directory Structure

```
├── electron/                 # Main Process Functionality (Electron)
│   ├── main.js               # Electron entry point
│   ├── windowManager.js      # Window creation, bounds, and drag
│   ├── ipcHandlers.js        # IPC Handlers to manage state, files, and events
│   └── services/             # Backend Services
│       ├── aiService.js      # Base Gemini integration
│       └── geminiLiveService.js # WebSocket for Gemini Live (streaming)
├── public/                   # Static files and icons
├── src/                      # Frontend Source Code (React)
│   ├── App.tsx               # Main controller and router (MiniChat ↔ Susurro)
│   ├── components/           # UI Components
│   │   ├── chat/             # MiniChat UI (Header, Body, Input)
│   │   ├── susurro/          # Recorder and insights UI (SusurroHeader, Overlay)
│   │   └── common/           # Shared menus, icons, and overlays
│   ├── hooks/                # Custom React Hooks
│   ├── styles/               # Global and component-specific CSS
│   ├── types/                # TypeScript Definitions
│   └── main.tsx              # React initialization point
├── prompts/                  # Context instructions for AI agents
├── package.json              # npm and Electron Builder configurations
└── vite.config.ts            # Vite build configurations
```

### Data Flow & IPC

Hades communicates its graphical interface (React) with APIs and file manipulation (Node.js) through the `contextBridge` defined in `preload.js`. 

```
User Action (React) 
  → window.electronAPI (Preload) 
    → ipcMain.on / handle (Node.js / Electron) 
      → aiService.js or sessions.json
        → window.webContents.send (Response to React)
```

### Key Components

**Sessions System (`sessions.json`)**
- Transcriptions and conversations are saved in session format. The application asks the AI to generate a short title and permanently saves it to the HDD.

**Real-Time Resizing (`windowManager.js`)**
- We use the `resize-window-fast` IPC pattern instead of promise-based IPC channels. The client fires fast mouse events via `requestAnimationFrame`, allowing the Electron window to be dragged and expanded at 60fps without Main-Thread delay.

**Integrated Gemini Live**
- In Susurro mode, we activate `isSuggestionsMode` in the Gemini WebSocket streaming. This instructs the AI model to return instant insights filtering its own "Internal Monologues" to avoid polluting the user's final view.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts development server (React + Electron) with Auto-Reload. |
| `npm run build` | Builds production only for the React layer. |
| `npm run package` | Builds the Electron executable for Windows (`.exe`). |
| `npm run dist` | Builds React and then packages it into installable (`nsis`) and portable formats. |
| `npm run test` | Runs tests with Vitest. |

---

## Deployment & Packaging

To distribute the application, use `electron-builder` which is properly configured in `package.json`.

### Generating Installers (Windows)

```bash
npm run dist
```

This will create a `release/` folder in the root of your project containing:
- `Hades-Agent-Setup-2.0.1.exe` (Traditional installer)
- `Hades-Agent-2.0.1-portable.exe` (Standalone app)
- `.zip` files and optional unpacked files.

---

## Troubleshooting

### Stuck Port Errors (Port 3000)
**Problem:** Vite reports that port 3000 is already in use.
**Solution:** The `npm run dev` script tries to kill the port via `kill-port`. If it persists, run in the Windows terminal: 
`npx kill-port 3000`

### Window Freezes on Resize
**Solution:** Make sure there is no CSS component doing `transition: all` on `.app-container`. CSS layout transitions tied with Electron's ResizeObserver freeze the OS Main Thread.

### Gemini API Returning Error
**Solution:** Verify if your `.env` was loaded correctly. Since the file is at the root of Electron, `dotenv` initialized in `main.js` will read it. 

---

## Settings and API Keys

The system manages keys dynamically and securely, without the need for exposed `.env` files in the root.

### How to Configure

| Setting | Description | Where to Find / Insert |
| --- | --- | --- |
| `GEMINI_API_KEY` | Google Gemini API Key for AI and chat | Settings Menu (`Alt + S`) |

### Access via Electron

The key entered in the Settings UI is passed to the backend services (`aiService.js`, `geminiLiveService.js`) using the Electron process (via `ipcRenderer.invoke`). The Backend saves these settings and manages them in isolation, preventing access keys from being insecurely transmitted or leaked when building the web application with Vite.

---

## Testing

The environment is configured to use **Vitest** due to native integration with Vite.

### Running Tests

```bash
# Run all tests in watch mode
npm run test

# To run once in continuous integration (CI)
npx vitest run
```

*Note: Tests can still be expanded to cover IPC (Inter-Process Communication) integrations using mocks for native Electron modules.*

---

## Contributing

If you want to contribute to the project:
1. Fork the repository.
2. Create a branch for your feature (`git checkout -b feature/my-feature`).
3. Commit your changes (`git commit -m 'feat: add my feature'`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Open a Pull Request.

---

## License

This project is licensed under the **MIT License**.

The MIT License is a short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.

Copyright (c) 2026, Victor L. Oliveira
