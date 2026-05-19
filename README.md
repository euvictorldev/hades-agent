# 🌋 Hades Desktop AI Agent

<p align="center">
  <img src="public/icon/icon.png" width="140" height="140" style="border-radius: 8px 32px 8px 32px; border: 2px solid #ff2a2a; box-shadow: 0 20px 40px rgba(255, 42, 42, 0.15);" alt="Hades Logo" />
</p>

<p align="center">
  <strong>A weightless, ultra-fast, spatial desktop AI assistant built on Electron, React, and Google Gemini.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-42.0-red?style=for-the-badge&logo=electron&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19.0-red?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-8.0-red?style=for-the-badge&logo=vite&logoColor=FFD62E" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-red?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

---

## ⚡ Concept & Design Philosophy

**Hades** is not a conventional flat web-app-in-a-box. It is designed around the principles of **Antigravity Design**—creating a weightless, highly spatial, and layered user interface that feels alive.

*   **🪶 Weightlessness:** Floating cards, transparent backdrops, and soft diffused shadows (`box-shadow: 0 20px 40px rgba(0,0,0,0.5)`) create a glassy, premium feel.
*   **🔮 Glassmorphism:** Subtle translucency using `backdrop-filter: blur(16px)` combined with ultra-thin semi-transparent borders for high-end contrast.
*   **🩸 Continuous Gradients & Retro Aesthetics:** Visual palettes rely on harmonious HSL crimson-to-dark-underworld gradients, paired with retro-arcade typography (`Press Start 2P`) for a distinct sci-fi aesthetic.
*   **🕹️ Dynamic Smoothness:** State changes (hovers, focus states, activations) never snap. They utilize smooth transitions (`0.3s cubic-bezier(0.16, 1, 0.3, 1)`) to offload GPU rendering via `will-change`.

---

## 📦 Spatial Architecture

Hades manages multiple independent, transparent, and floating renderer windows coordinated by a robust backend. Here is how the spatial systems align:

```mermaid
graph TD
    classDef main fill:#1a0505,stroke:#ff2a2a,stroke-width:2px,color:#fff;
    classDef float fill:#0a0303,stroke:#dc2626,stroke-width:1px,color:#fff;
    classDef service fill:#111,stroke:#888,stroke-width:1px,color:#aaa;

    Main[Electron Main Process]:::main
    
    subgraph Floating_Windows [Weightless UI Overlays]
        CommandBar[Alt+D: Spotlight Command Bar]:::float
        MiniChat[MiniChat Floating Window]:::float
        Susurro[Alt+B: Susurro Voice HUD]:::float
        Settings[Settings Panel]:::float
    end
    
    SSoT[ElectronService SSoT Bridge]:::service
    Store[JsonStore Local DB]:::service

    Main -->|Orchestrates Window State| Floating_Windows
    Floating_Windows -->|Typed IPC Calls| SSoT
    SSoT -->|Electron Bridge| Main
    Main -->|Persists config/history| Store
```

---

## ✨ Key Features

*   **🎙️ Susurro (Voice Assistant):** Activated via `Alt+B`, this module performs real-time speech-to-text utilizing Gemini Flash. It streams microphone and system audio, delivering modular, context-aware suggestions directly onto your viewport.
*   **💬 MiniChat Overlay:** A lightweight, non-intrusive floating canvas. Perfect for coding guidance, quick reviews, and prompt testing without breaking your current workflow.
*   **⌨️ Spotlight Command Bar (`Alt+D`):** A beautiful, centralized search launcher. Takes raw inputs, queries Tavily for live web intelligence, and displays gorgeous, formatted markdown results.
*   **🕶️ Screen-Recording Stealth Mode:** Utilizing hardware-level window protection (`setContentProtection`), Hades is completely invisible to screen captures, recorders, and streaming tools—keeping your credentials and private codes fully secure.
*   **🎭 Local Persona Management:** Dynamically create, configure, and save customized AI personas with specific system prompts, saved in a persistent JSON database.

---

## 🛠️ Installation & Setup

### Prerequisites

*   Node.js (v18.x or later)
*   npm or yarn

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/victorl-dev/Hades-Agent.git
cd Hades-Agent
npm install
```

### 2. Configure API Keys

Hades utilizes Google Gemini and Tavily Search APIs.

1. Copy the environment configuration template:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your credentials:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_TAVILY_API_KEY=your_tavily_api_key_here
   ```
   *(Note: The `.env` file is protected locally and ignored by Git to prevent exposure).*

### 3. Run in Development Mode

Run the React frontend build and launch the Electron application concurrently:

```bash
npm run dev
```

### 4. Build for Production

Compile your production-ready client bundles using Vite:

```bash
npm run build
```

---

## ⌨️ Hotkeys

| Shortcut | Action | Destination |
| :--- | :--- | :--- |
| `Alt+D` | Toggle Spotlight Launcher | **Command Bar** |
| `Alt+B` | Open / Start Real-time Speech-to-Text | **Susurro Voice HUD** |
| `Esc` | Stop Recording / Hide active UI | **All Panels** |

---

## 🛡️ License

This project is licensed under the **ISC License**. Developed with passion by [victorl-dev](https://github.com/victorl-dev).
