# Graph Report - Hades  (2026-05-16)

## Corpus Check
- 74 files · ~51,331 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 277 nodes · 324 edges · 12 communities detected
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 61 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 17|Community 17]]

## God Nodes (most connected - your core abstractions)
1. `ElectronService` - 68 edges
2. `JsonStore` - 17 edges
3. `WindowManager` - 12 edges
4. `SkillService` - 8 edges
5. `initIPC()` - 7 edges
6. `Logger` - 7 edges
7. `TranslationService` - 7 edges
8. `useSusurro()` - 6 edges
9. `DreamService` - 5 edges
10. `GeminiLiveService` - 5 edges

## Surprising Connections (you probably didn't know these)
- `initIPC()` --calls--> `registerChatHandlers()`  [INFERRED]
  electron\ipc\index.js → electron\ipc\chatHandlers.js
- `initIPC()` --calls--> `registerWindowHandlers()`  [INFERRED]
  electron\ipc\index.js → electron\ipc\windowHandlers.js
- `initIPC()` --calls--> `registerPersonaHandlers()`  [INFERRED]
  electron\ipc\index.js → electron\ipc\personaHandlers.js
- `initIPC()` --calls--> `registerTaskHandlers()`  [INFERRED]
  electron\ipc\index.js → electron\ipc\taskHandlers.js
- `initIPC()` --calls--> `registerSusurroHandlers()`  [INFERRED]
  electron\ipc\index.js → electron\ipc\susurroHandlers.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (1): ElectronService

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (6): listModels(), DreamService, GeminiLiveService, SearchService, SessionLogger, TaskService

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (11): useAudioRecorder(), useChatState(), useClipboard(), useGemini(), useMiniChat(), usePersonas(), useSusurro(), useTranscription() (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (1): JsonStore

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (7): loadEnv(), _doInit(), handleTranslateTask(), init(), AIService, Logger, formatDate()

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (7): registerChatHandlers(), initIPC(), registerPersonaHandlers(), registerSusurroHandlers(), registerTaskHandlers(), registerToolHandlers(), registerWindowHandlers()

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (1): WindowManager

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (2): TranslationService, App()

### Community 8 - "Community 8"
Cohesion: 0.42
Nodes (1): SkillService

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (2): handleComplete(), handleProgress()

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (1): handleKeyDown()

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (1): AppState

## Knowledge Gaps
- **1 isolated node(s):** `AppState`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 0`** (67 nodes): `ElectronService`, `.captureAllScreens()`, `.captureSource()`, `.deletePersona()`, `.deleteTask()`, `.downloadTranslationModel()`, `.electron()`, `.endSession()`, `.generateSuggestion()`, `.getChat()`, `.getLearnings()`, `.getLolPlayerStats()`, `.getPersonas()`, `.getSources()`, `.getSystemAudioSourceId()`, `.getTotalTokens()`, `.handleResponse()`, `.isMaximized()`, `.isMinimized()`, `.isPinned()`, `.listSkills()`, `.loadSkill()`, `.logSession()`, `.minimizeWindow()`, `.notifHidden()`, `.onCaptureEvent()`, `.onExecuteTask()`, `.onFocusInput()`, `.onNewChatMessage()`, `.onNewSuggestion()`, `.onNotify()`, `.onStartVoice()`, `.onSusurroLiveDelta()`, `.onSusurroLiveStatus()`, `.onToggleSusurroTranscriptionSignal()`, `.onTranslationDownloadComplete()`, `.onTranslationDownloadError()`, `.onTranslationDownloadProgress()`, `.onTranslationDownloadStatus()`, `.onVoiceSend()`, `.openExternal()`, `.resizeWindow()`, `.saveChat()`, `.savePersona()`, `.saveSkill()`, `.saveSusurroMessage()`, `.scheduleTask()`, `.searchWeb()`, `.sendMessage()`, `.sendSusurroChunk()`, `.sendSusurroSetupComplete()`, `.showChat()`, `.showNotification()`, `.startResizing()`, `.startSusurroLive()`, `.stopSusurroLive()`, `.toggleAudio()`, `.toggleMic()`, `.togglePin()`, `.toggleSuggestions()`, `.transcribeAudio()`, `.translateIncremental()`, `.translateText()`, `.updateChatPin()`, `.updateChatStatus()`, `.updateTokens()`, `electron.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 3`** (20 nodes): `jsonStore.js`, `.getTasks()`, `.checkTasks()`, `JsonStore`, `.constructor()`, `.getChatHistory()`, `.getPersonas()`, `.getSusurroHistory()`, `.getTasks()`, `.getTotalTokens()`, `.getTranslationCache()`, `.loadAll()`, `.safeLoad()`, `.safeSave()`, `.saveChatHistory()`, `.savePersonas()`, `.saveSusurroHistory()`, `.saveTasks()`, `.saveTokens()`, `.saveTranslationCache()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (12 nodes): `windowManager.js`, `WindowManager`, `.constructor()`, `.createChatWindow()`, `.createCommandWindow()`, `.createNotificationWindow()`, `.createSuggestionsWindow()`, `.createSusurroSetupWindow()`, `.createSusurroWindow()`, `.createVoiceWindow()`, `.createWindow()`, `.setupExternalLinks()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (11 nodes): `translationService.js`, `TranslationService`, `.checkModelReady()`, `.getWorker()`, `.handleWorkerMessage()`, `.translate()`, `.translateIncremental()`, `.translateLibre()`, `App()`, `App.tsx`, `.get()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (9 nodes): `skillService.js`, `SkillService`, `.constructor()`, `._getFilePath()`, `.listSkills()`, `.loadSkill()`, `._parseSkillFile()`, `.saveSkill()`, `._serializeSkillFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (8 nodes): `getDescription()`, `getIcon()`, `getTitle()`, `handleComplete()`, `handleError()`, `handleProgress()`, `startDownload()`, `SusurroSetup.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (4 nodes): `getButtonText()`, `handleKeyDown()`, `.closeWindow()`, `VoiceRecorder.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `AppState`, `appState.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ElectronService` connect `Community 0` to `Community 3`, `Community 11`?**
  _High betweenness centrality (0.173) - this node is a cross-community bridge._
- **Why does `WindowManager` connect `Community 6` to `Community 7`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `initIPC()` (e.g. with `registerWindowHandlers()` and `registerChatHandlers()`) actually correct?**
  _`initIPC()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AppState` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._