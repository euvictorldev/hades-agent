<p align="center">
  <img src="https://res.cloudinary.com/dmii83n8i/image/upload/fl_preserve_transparency/v1779237561/hades-agent_cx7vq7.jpg?_s=public-apps" alt="Hades Banner" width="100%" style="border-radius: 16px; max-width: 800px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
</p>

<table>
  <tr>
    <td width="35%" align="center" valign="middle">
      <img src="public/icon/icon.png" width="340" style="border-radius: 48px; border: 6px solid #ff2a2a; box-shadow: 0 20px 50px rgba(255, 42, 42, 0.5); display: block; margin-bottom: 20px;" alt="Hades Agent Logo" />
      <p align="center" style="margin-top: 12px; margin-bottom: 0;">
        <img src="https://img.shields.io/badge/License-MIT-red?style=flat-square&color=150202" alt="License" style="display: inline-block; vertical-align: middle;" />
        <img src="https://img.shields.io/badge/Electron-42.0-red?style=flat-square&logo=electron&logoColor=white&color=150202" alt="Electron" style="display: inline-block; vertical-align: middle;" />
        <img src="https://img.shields.io/badge/React-19.0-red?style=flat-square&logo=react&logoColor=61DAFB&color=150202" alt="React" style="display: inline-block; vertical-align: middle;" />
      </p>
    </td>
    <td width="65%" valign="top">
      <h1>Hades Agent <img src="https://res.cloudinary.com/dmii83n8i/image/upload/v1779237864/icon-tray-round_gkqtv0.png" width="36" height="36" align="center" style="display: inline-block; vertical-align: middle; margin-left: 6px;" alt="Hades Icon" /></h1>
      <p><strong>Hades Agent: An invisible, ultra-fast desktop AI companion built with Electron and Gemini Live API. Featuring real-time voice streaming, a native Stealth Mode (invisible to OBS/screen-shares), lightning-fast web search, plus background memory dreaming.</strong></p>
      <p>Hades Agent is an ultra-lightweight AI companion that lives on your computer in an entirely new way. Instead of being stuck inside a browser tab, it floats freely over your open windows, listens and talks to you in real-time, searches the web in seconds, and automatically hides from screen recordings to keep your data 100% safe!</p>
      <p>Built with <strong>Electron</strong>, <strong>React</strong>, <strong>Vite</strong>, and powered by Google's cutting-edge <strong>Gemini Multimodal Live API</strong>, Hades is engineered to be extremely fast, responsive, and smart.</p>
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
<tr><td><b>Anti-Recording Shield</b></td><td>Native OS-level content protection. Hades magically becomes completely invisible on OBS Studio, Discord, Teams, Zoom screen-shares, and Windows screenshots to prevent private data leaks.</td></tr>
<tr><td><b>Voice HUD (Susurro)</b></td><td>Press <code>Alt+B</code> to talk naturally. Direct 16kHz raw PCM streaming via ultra-low latency WebSockets directly to Google's Gemini Live API with sub-100ms response times.</td></tr>
<tr><td><b>Spotlight Command Bar</b></td><td>Press <code>Alt+D</code> to summon a floating, transparent search bar. Get real-time internet-enabled answers instantly powered by the Tavily Search API.</td></tr>
<tr><td><b>Session-Specific MiniChat</b></td><td>Dynamic chat HUD showing active model specs and token consumption in real-time. Wipe your session instantly to reset timers, history, and usage cost back to zero.</td></tr>
<tr><td><b>Memory dreaming consolidation</b></td><td>Offline artificial sleep schedules background cycles to synthesize recent logs, automatically updating your highly compressed local <code>learnings.json</code> memory profile.</td></tr>
<tr><td><b>Task & Reminder scheduler</b></td><td>Offline to-do ledger managed through secure IPC database handlers to schedule and monitor daily tasks fully local and offline.</td></tr>
</table>

---

## <img src="https://api.iconify.design/lucide:download.svg?color=%23ff2a2a" width="22" height="22" align="center" style="vertical-align: middle; margin-right: 8px;" /> Getting Started

### For Users (Download Installer)
1. Head to the **[Releases](https://github.com/victorl-dev/Hades-Agent/releases)** page.
2. Download the latest official Windows installer (`Hades-Setup-X.Y.Z.exe`).
3. Launch the app, press **`Alt+S`** inside the app to save your API keys, and start chatting!

### For Developers (Build from Source)
Make sure you have **[Node.js](https://nodejs.org/)** (v18.x or newer) installed. Then run:

```bash
# Clone the repository
git clone https://github.com/victorl-dev/Hades-Agent.git
cd Hades-Agent

# Install workspace dependencies
npm install

# Start the concurrent hot-reload development process
npm run dev
```

---

## <img src="https://api.iconify.design/lucide:keyboard.svg?color=%23ff2a2a" width="22" height="22" align="center" style="vertical-align: middle; margin-right: 8px;" /> Keyboard Shortcuts

Hades floats quietly over your desktop and can be summoned instantly from anywhere:

| Shortcut | Action |
| :--- | :--- |
| **`Alt+D`** | Summon Spotlight Command Bar |
| **`Alt+B`** | Summon Susurro Voice HUD |
| **`Alt+S`** | Open Settings & Shortcut Customization |
| **`Esc`** | Instantly hide active window and restore focus |

> [!TIP]
> You can fully customize all hotkeys inside the **Shortcuts** tab in the Settings panel (`Alt+S`)!

---

## <img src="https://api.iconify.design/lucide:network.svg?color=%23ff2a2a" width="22" height="22" align="center" style="vertical-align: middle; margin-right: 8px;" /> System Architecture

Hades orchestrates transparent renderer overlay windows and backend security pipelines using high-speed IPC event protocols:

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
        Susurro[Alt+B: Susurro Voice HUD]:::float
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

Hades Agent was co-engineered with Google's **Antigravity** (Advanced Agentic Coding Assistant by Google DeepMind) using **Subagent-Driven Development (SDD)**:
- **Modular Autonomy:** Specialized subagents built individual IPC event engines, cryptography wrappers, and voice pipelines under high-speed validation loops.
- **Strict Quality Constraints:** Clean code architecture keeping custom React hook sizes minimal, utilizing a centralized State Store (`jsonStore.js`), and keeping production compilation times under **760ms**.

---

## <img src="https://api.iconify.design/lucide:sparkles.svg?color=%23ff2a2a" width="22" height="22" align="center" style="vertical-align: middle; margin-right: 8px;" /> Inspiration & Credits

> [!NOTE]
> Hades Agent is inspired by **Persua**, a conceptual real-time voice and AI assistant created by software engineer **Lucas Montano** (@lucasmontano). Hades was engineered entirely from scratch to explore raw PCM streaming, full-duplex WebSockets, and content-protection algorithms in Electron. Thank you, Lucas, for inspiring the community! 🚀

---

## <img src="https://api.iconify.design/lucide:star.svg?color=%23ff2a2a" width="22" height="22" align="center" style="vertical-align: middle; margin-right: 8px;" /> Star History

[![Star History Chart](https://api.star-history.com/svg?repos=victorl-dev/Hades-Agent&type=Date)](https://star-history.com/#victorl-dev/Hades-Agent&Date)

---

## <img src="https://api.iconify.design/lucide:file-text.svg?color=%23ff2a2a" width="22" height="22" align="center" style="vertical-align: middle; margin-right: 8px;" /> License

MIT — See [LICENSE](LICENSE).

Built with 🖤 by [Victor L.](https://github.com/victorl-dev)
