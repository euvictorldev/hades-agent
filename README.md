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
      <p><strong>Hades is an invisible, ultra-fast desktop companion with autonomous background memory consolidation and a local task scheduler.</strong></p>
      <p><strong>Safety Limits:</strong> Sandboxed with <strong>zero system-write access</strong> (cannot create, edit, or delete files, nor run scripts). The AI is strictly restricted to real-time Google queries (via Tavily) and local memory logs, keeping your PC 100% safe.</p>
    </td>
  </tr>
</table>

<p align="center" style="margin-top: 20px;">
  <a href="https://github.com/victorl-dev/Hades-Agent/releases"><img src="https://img.shields.io/badge/Releases-Download-FF2A2A?style=for-the-badge&logo=github" alt="Releases"></a>
  <a href="https://github.com/victorl-dev/Hades-Agent/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License: MIT"></a>
  <a href="https://github.com/victorl-dev/Hades-Agent"><img src="https://img.shields.io/badge/Built%20With-Gemini%20Live%20API-blueviolet?style=for-the-badge" alt="Built with Gemini Live"></a>
  <a href="https://github.com/victorl-dev/Hades-Agent"><img src="https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Platform: Windows"></a>
</p>

<table>
<tr>
  <td><b>🛡️ Anti-Recording Shield</b></td>
  <td>Native OS-level content protection via <code>setContentProtection</code>. Hades becomes <strong>completely invisible</strong> to OBS Studio, Discord, Teams, Zoom, and all Windows screen-capture APIs — your private data never leaks through shared screens.</td>
</tr>
<tr>
  <td><b>🎙️ Real-time Transcription (Alt+B)</b></td>
  <td>Press <code>Alt+B</code> to capture and transcribe PC internal audio (like meetings or video classes) in real-time. Streams raw <strong>16 kHz PCM audio</strong> over a full-duplex WebSocket directly to the <strong>Gemini Live API</strong>, achieving sub-100ms transcription latency.</td>
</tr>
<tr>
  <td><b>⚡ Spotlight Command Bar</b></td>
  <td>Press <code>Alt+D</code> to summon a floating, borderless command bar. Delivers <strong>real-time internet-grounded answers</strong> powered by the Tavily Search API — attach images, switch AI models, and get answers without ever leaving your workflow.</td>
</tr>
<tr>
  <td><b>💬 Session MiniChat</b></td>
  <td>A persistent chat HUD that displays the <strong>active model, live token count, and session cost</strong>. Wipe the session instantly to reset all timers, history, and spend back to zero — no restart required.</td>
</tr>
<tr>
  <td><b>🧠 Dream Memory Consolidation</b></td>
  <td>Scheduled background AI cycles synthesize recent session logs into a <strong>compressed <code>learnings.json</code> memory profile</strong> — similar to how the brain consolidates long-term memory during sleep. Runs fully offline.</td>
</tr>
<tr>
  <td><b>📋 Safe Task Scheduler</b></td>
  <td>A strictly sandboxed, <strong>offline task ledger</strong> with zero system-write permissions. Safely schedule automated web searches, create daily reminders, and organize MiniChat responses without risking modifications to your local files. Managed through encrypted IPC database handlers.</td>
</tr>
</table>

---

## <img src="https://api.iconify.design/lucide:download.svg?color=%23ff2a2a" width="22" height="22" align="center" style="vertical-align: middle; margin-right: 8px;" /> Getting Started

### For Users (Download Installer)

1. Head to the **[Releases](https://github.com/victorl-dev/Hades-Agent/releases)** page.
2. Download **`Hades-Agent-Setup-1.0.0.exe`** (or the `.zip` portable version).
3. Run the installer, launch Hades, then press **`Alt+S`** to enter your API keys.

> [!WARNING]
> **Platform:** Hades has been tested exclusively on **Windows 10**. Windows 11 may work but is untested. macOS and Linux are **not supported** — the Anti-Recording Shield (`setContentProtection`) and global hotkey registration rely on Windows-specific Electron APIs.

> [!IMPORTANT]
> Hades requires two free API keys to operate:
> - **[Google Gemini API Key](https://aistudio.google.com/app/apikey)** — for all AI inference and voice streaming.
> - **[Tavily Search API Key](https://app.tavily.com/)** — for real-time web search grounding.

### For Developers (Build from Source)

**Prerequisites**

| Requirement | Version | Notes |
| :--- | :--- | :--- |
| [Node.js](https://nodejs.org/) | v18.x or newer | LTS recommended |
| npm | bundled with Node.js | — |
| Windows | 10 / 11 | `setContentProtection` is Windows-only |

```bash
# 1. Clone the repository
git clone https://github.com/victorl-dev/Hades-Agent.git
cd Hades-Agent

# 2. Install all dependencies
npm install

# 3. Launch the concurrent hot-reload dev environment
npm run dev
```

The dev server starts Vite (React renderer on `:3000`) and Electron concurrently with full hot-reload on both sides.

---

## <img src="https://api.iconify.design/lucide:keyboard.svg?color=%23ff2a2a" width="22" height="22" align="center" style="vertical-align: middle; margin-right: 8px;" /> Keyboard Shortcuts

Hades lives silently in your system tray and can be summoned from any application, at any time:

| Shortcut | Action |
| :--- | :--- |
| **`Alt+D`** | Summon / dismiss the Spotlight Command Bar |
| **`Alt+B`** | Summon / dismiss the Real-time Transcription HUD |
| **`Alt+S`** | Open Settings & Shortcut Customization |
| **`Alt+V`** | Toggle voice input mode |
| **`Esc`** | Hide the active window and restore prior focus |

> [!TIP]
> Every shortcut is fully rebindable. Open the **Shortcuts** tab inside Settings (`Alt+S`) to assign your own key combinations.

---

## <img src="https://api.iconify.design/lucide:network.svg?color=%23ff2a2a" width="22" height="22" align="center" style="vertical-align: middle; margin-right: 8px;" /> System Architecture

Hades orchestrates multiple transparent overlay windows through a strict **IPC event bridge**, keeping the renderer completely sandboxed from the filesystem while the main process handles all privileged operations:

```mermaid
graph TD
    classDef main fill:#1a0505,stroke:#ff2a2a,stroke-width:2px,color:#fff;
    classDef float fill:#0a0303,stroke:#dc2626,stroke-width:1px,color:#fff;
    classDef service fill:#111,stroke:#888,stroke-width:1px,color:#aaa;
    classDef external fill:#2b0c0c,stroke:#f97316,stroke-width:1px,color:#ffed4a;

    Main[Electron Main Process]:::main
    
    subgraph UI_Layers [Transparent Overlay Windows]
        CommandBar[Alt+D: Spotlight Command]:::float
        MiniChat[MiniChat Dynamic Window]:::float
        Susurro[Alt+B: Real-time Transcription HUD]:::float
        Notification[Alerts & Notifications]:::float
        Settings[Alt+S: Settings & Shortcuts]:::float
    end
    
    SSoT[IPC Bridge Protocol]:::service
    Store[AES-256 Secure JsonStore]:::service
    Dream[DreamService AI Sleep]:::service
    
    subgraph Cloud_APIs [Cloud Intelligence Services]
        Gemini[Gemini Live API]:::external
        Tavily[Tavily Search API]:::external
    end

    Main -->|Manages Window States| UI_Layers
    UI_Layers -->|IPC Signals & Actions| SSoT
    SSoT -->|Electron Event Handlers| Main
    Main -->|Reads/Writes AES-256 Secrets| Store
    Main -->|Schedules AI Consolidation| Dream
    Dream -->|Persists Insights| Store
    
    Main <-->|16kHz Raw PCM Audio Stream| Gemini
    Main <-->|Asynchronous Web Queries| Tavily
```

---

## <img src="https://api.iconify.design/lucide:cpu.svg?color=%23ff2a2a" width="22" height="22" align="center" style="vertical-align: middle; margin-right: 8px;" /> AI-Assisted Engineering

Hades was co-engineered with **[Google Antigravity](https://deepmind.google/)** (Advanced Agentic Coding Assistant by Google DeepMind) using **Subagent-Driven Development (SDD)**:

- **Modular Autonomy:** Specialized subagents independently built IPC event engines, AES-256 cryptography wrappers, voice PCM pipelines, and window lifecycle managers — each validated in isolation before integration.
- **Strict Quality Gates:** Architecture enforces minimal custom React hook sizes, a single centralized state store (`jsonStore.js`), and production Vite compilation times consistently under **760 ms**.
- **Continuous Hardening:** Security subagents enforced sandbox isolation, Content Security Policy headers, and `contextIsolation` at every IPC boundary, with no `nodeIntegration` exposure to the renderer.

---

## <img src="https://api.iconify.design/lucide:sparkles.svg?color=%23ff2a2a" width="22" height="22" align="center" style="vertical-align: middle; margin-right: 8px;" /> Inspiration & Credits

> [!NOTE]
> Hades Agent is inspired by **Persua**, a conceptual real-time voice and AI assistant created by software engineer **Lucas Montano** ([@lucasmontano](https://github.com/lucasmontano)). Hades was engineered entirely from scratch to explore raw PCM streaming, full-duplex WebSockets, and OS-level content-protection algorithms in Electron. Thank you, Lucas, for pushing the community to build things that don't exist yet.

---

## <img src="https://api.iconify.design/lucide:star.svg?color=%23ff2a2a" width="22" height="22" align="center" style="vertical-align: middle; margin-right: 8px;" /> Star History

[![Star History Chart](https://api.star-history.com/svg?repos=victorl-dev/Hades-Agent&type=Date)](https://star-history.com/#victorl-dev/Hades-Agent&Date)

---

## <img src="https://api.iconify.design/lucide:file-text.svg?color=%23ff2a2a" width="22" height="22" align="center" style="vertical-align: middle; margin-right: 8px;" /> License

MIT — See [LICENSE](LICENSE).

Built with dedication by [Victor L.](https://github.com/victorl-dev)

