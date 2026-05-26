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
      <p><strong>O Hades Agent é um assistente virtual inteligente para desktop (Windows), construído com Electron e React. Ele funciona como um "floating widget" que oferece chat de texto avançado e um poderoso modo de transcrição por voz com insights em tempo real via Gemini Live.</strong></p>
      <p><strong>Limites de Segurança:</strong> Sandboxed com <strong>zero acesso de gravação no sistema</strong> (não pode criar, editar ou deletar arquivos locais nativamente pelo chat). A inteligência foca inteiramente no suporte e produtividade da interface.</p>
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

- **MiniChat:** Um chat flutuante minimalista, conversando diretamente com a IA, projetado para acesso rápido e atalhos globais.
- **Modo Susurro (Insights em Tempo Real):** Muito mais que um simples gravador de voz. Ao ativar o modo "Sugestões/Insights", o Hades deixa de atuar apenas como um transcritor e passa a ouvir ativamente o seu contexto. Ele funciona como um *parceiro de brainstorming*, identificando perguntas, problemas ou tópicos de discussão em tempo real e fornecendo ideias, respostas rápidas e soluções diretamente na tela. O modelo foi estritamente instruído (via `insight_rules.md`) a ser conciso, ágil e a ocultar monólogos internos (CoT), entregando apenas o valor final diretamente para você ler enquanto fala.
- **Histórico Persistente:** O aplicativo salva automaticamente suas sessões de texto e áudio no backend, gerando títulos inteligentes baseados no contexto da conversa.
- **Overlay & Glassmorphism UI:** Design premium com transparências fluidas, menus laterais e alta responsividade.
- **Redimensionamento Nativo:** Loop de redimensionamento de janela otimizado em nível de sistema (`requestAnimationFrame` + IPC fast-fire) para desempenho imaculado em Windows.

---

## Tech Stack

- **Linguagem:** TypeScript / JavaScript (Node.js + Browser)
- **Framework Desktop:** Electron (v42+)
- **Frontend:** React 19 + Vite 8
- **Estilização:** CSS Vanilla puro com CSS Variables & Backdrop Filters
- **IA e APIs:** `@google/genai`, `@google/generative-ai`, `@google-cloud/speech`
- **Áudio:** `recordrtc`
- **Empacotador:** `electron-builder`

---

## Prerequisites

- Node.js 20 ou superior.
- NPM ou pnpm.
- Uma chave de API válida do **Google Gemini API**.
- SO: Windows (o empacotamento é focado em `.exe` e portable apps no Windows).

---

## Getting Started

### 1. Clonar o Repositório

```bash
git clone https://github.com/seuperfil/hades-agent.git
cd hades-agent
```

### 2. Instalar as Dependências

```bash
npm install
```

### 3. Configurar a Chave de API

Não é necessário criar um arquivo `.env` manualmente. Ao iniciar o aplicativo pela primeira vez, você pode configurar sua chave de API diretamente na interface do sistema:
1. Abra as **Configurações** clicando no ícone de engrenagem ou pressionando o atalho global `Alt + S`.
2. Insira sua chave do **Google Gemini API**.
3. A chave será criptografada e salva localmente pelo Electron de forma segura.

### 4. Executar em Ambiente de Desenvolvimento

O comando abaixo iniciará paralelamente o Vite (para compilar o React) e o Electron (sua janela nativa).

```bash
npm run dev
```

*Nota: Em caso de travamentos residuais, o comando automaticamente mata portas 3000 presas e finaliza processos zumbis do Electron.*

---

## Architecture

O Hades Agent utiliza uma arquitetura unificada de Janela Única. O estado principal de aplicação alterna as interfaces internas, mantendo a janela do Electron viva e redimensionando de acordo.

### Directory Structure

```
├── electron/                 # Funcionalidades do Processo Main (Electron)
│   ├── main.js               # Ponto de entrada do Electron
│   ├── windowManager.js      # Criação da janela, bounds e drag
│   ├── ipcHandlers.js        # Handlers IPC para gerenciar estado, arquivos e eventos
│   └── services/             # Serviços do Backend
│       ├── aiService.js      # Integração base do Gemini
│       └── geminiLiveService.js # WebSocket para o Gemini Live (streaming)
├── public/                   # Arquivos estáticos e ícones
├── src/                      # Código Fonte Frontend (React)
│   ├── App.tsx               # Controlador principal e roteador (MiniChat ↔ Susurro)
│   ├── components/           # Componentes UI
│   │   ├── chat/             # UI do MiniChat (Header, Body, Input)
│   │   ├── susurro/          # UI do gravador e insights (SusurroHeader, Overlay)
│   │   └── common/           # Menus, ícones e overlays compartilhados
│   ├── hooks/                # Custom React Hooks
│   ├── styles/               # CSS global e específico por componente
│   ├── types/                # Definições TypeScript
│   └── main.tsx              # Ponto de inicialização do React
├── prompts/                  # Instruções de contexto para os agentes IA
├── package.json              # Configurações do npm e Electron Builder
└── vite.config.ts            # Configurações de build do Vite
```

### Data Flow & IPC

O Hades comunica sua interface gráfica (React) com as APIs e manipulação de arquivos (Node.js) através do `contextBridge` definido no `preload.js`. 

```
Ação do Usuário (React) 
  → window.electronAPI (Preload) 
    → ipcMain.on / handle (Node.js / Electron) 
      → aiService.js ou sessions.json
        → window.webContents.send (Resposta pro React)
```

### Key Components

**Sistema de Sessões (`sessions.json`)**
- As transcrições e conversas são salvas em formato de sessão. O aplicativo solicita que a IA gere um título curto e salva permanentemente no HD.

**Redimensionamento em Tempo Real (`windowManager.js`)**
- Usamos o padrão IPC `resize-window-fast` ao invés de canais IPC com promessas. O cliente dispara via `requestAnimationFrame` eventos rápidos de mouse, permitindo que a janela Electron seja arrastada e expandida a 60fps sem delay de Main-Thread.

**Gemini Live Integrado**
- Em modo Susurro, ativamos `isSuggestionsMode` no streaming WebSocket do Gemini. Isso instrui o modelo de IA a retornar insights instantâneos filtrando seus próprios "Internal Monologues" para não poluir a visualização final do usuário.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento (React + Electron) com Auto-Reload. |
| `npm run build` | Faz o build de produção apenas da camada React. |
| `npm run package` | Constrói o executável do Electron para Windows (`.exe`). |
| `npm run dist` | Faz o build do React e logo em seguida empacota em formato instalável (`nsis`) e portátil (`portable`). |
| `npm run test` | Roda testes com o Vitest. |

---

## Deployment & Packaging

Para distribuir a aplicação, utilize o `electron-builder` que já está devidamente configurado no `package.json`.

### Gerando Instaladores (Windows)

```bash
npm run dist
```

Isso criará uma pasta `release/` na raiz do seu projeto contendo:
- `Hades-Agent-Setup-1.0.0.exe` (Instalador tradicional)
- `Hades-Agent-1.0.0-portable.exe` (Standalone app)
- Arquivos `.zip` e descompactados opcionais.

---

## Troubleshooting

### Erros de Porta Presa (Port 3000)
**Problema:** O Vite informa que a porta 3000 já está em uso.
**Solução:** O script `npm run dev` tenta matar a porta via `kill-port`. Caso persista, execute no terminal do Windows: 
`npx kill-port 3000`

### A Janela Trava ao Redimensionar
**Solução:** Certifique-se de que não haja nenhum componente CSS fazendo `transition: all` no `.app-container`. Transições de layout CSS atreladas com o ResizeObserver do Electron travam a Main Thread do SO.

### Gemini API Retornando Erro
**Solução:** Verifique se o seu `.env` foi carregado corretamente. Como o arquivo fica na raiz do Electron, o `dotenv` inicializado no `main.js` fará a leitura. 

---

## Configurações e Chaves de API

O sistema gerencia chaves de forma dinâmica e segura, sem a necessidade de arquivos `.env` expostos na raiz.

### Como Configurar

| Configuração     | Descrição                                       | Onde Encontrar / Inserir                 |
| ---------------- | ----------------------------------------------- | ---------------------------------------- |
| `GEMINI_API_KEY` | Chave de API do Google Gemini para a IA e o chat| Menu de Configurações (`Alt + S`)        |

### Acesso via Electron

A chave inserida na UI de Configurações é repassada aos serviços backend (`aiService.js`, `geminiLiveService.js`) usando o processo do Electron (via `ipcRenderer.invoke`). O Backend salva essas configurações e as gerencia de forma isolada, evitando que chaves de acesso sejam trafegadas inseguramente ou vazadas na construção da aplicação web pelo Vite.

---

## Testing

O ambiente está configurado para usar o **Vitest** devido à integração nativa com o Vite.

### Executando Testes

```bash
# Rodar todos os testes no modo watch
npm run test

# Para rodar uma vez na integração contínua (CI)
npx vitest run
```

*Nota: Os testes ainda podem ser expandidos para cobrir as integrações de IPC (Inter-Process Communication) utilizando mocks para os módulos nativos do Electron.*

---

## Contributing

Se quiser contribuir com o projeto:
1. Faça um Fork do repositório.
2. Crie uma branch para a sua feature (`git checkout -b feature/minha-feature`).
3. Comite suas mudanças (`git commit -m 'feat: adiciona minha feature'`).
4. Faça o push para a branch (`git push origin feature/minha-feature`).
5. Abra um Pull Request.

---

## License

Este projeto está licenciado sob a **MIT License**.

A licença MIT é uma licença open-source permissiva, simples e clara. Ela permite livremente a utilização, cópia, modificação, mesclagem, publicação, distribuição, sublicenciamento e/ou venda de cópias deste software, desde que o aviso de copyright e o aviso de permissão sejam incluídos em todas as cópias ou partes substanciais do Software.

Copyright (c) 2026, Victor L. Oliveira
