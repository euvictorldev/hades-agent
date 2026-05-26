import React, { useEffect, useState } from 'react'
import MiniChat from './components/MiniChat'
import Susurro from './components/Susurro'
import SuggestionsPopup from './components/SuggestionsPopup'
import Splash from './components/Splash'
import Settings from './components/Settings'

const UnifiedApp: React.FC = () => {
  const urlParams = new URLSearchParams(globalThis.location.search);
  const windowType = urlParams.get('window');
  const [activeMode, setActiveMode] = useState<'chat' | 'susurro'>(windowType === 'susurro' ? 'susurro' : 'chat');

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: activeMode === 'chat' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <MiniChat activeMode={activeMode} onSwitchMode={setActiveMode} />
      </div>
      <div style={{ display: activeMode === 'susurro' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <Susurro activeMode={activeMode} onSwitchMode={setActiveMode} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const urlParams = new URLSearchParams(globalThis.location.search)
  const windowType = urlParams.get('window')

  useEffect(() => {
    console.log(
      `%c[HADES RENDERER] Window mounted: ${windowType || 'command'}`,
      'color: #00ffcc; font-weight: bold; font-size: 14px;'
    )
    console.log('[HADES RENDERER] Location:', globalThis.location.href)
    console.log('[HADES RENDERER] Document visibilityState:', document.visibilityState)
  }, [windowType])

  if (windowType === 'splash') {
    return <Splash />
  }

  if (windowType === 'susurro-standalone') {
    return <Susurro />
  }

  if (windowType === 'suggestions') {
    return <SuggestionsPopup />
  }

  if (windowType === 'settings') {
    return <Settings />
  }

  // Default is now UnifiedApp for 'chat', 'command' and 'susurro'
  return <UnifiedApp />
}

export default App
