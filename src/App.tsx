import React, { useEffect } from 'react'
import CommandBar from './components/CommandBar'
import MiniChat from './components/MiniChat'
import VoiceRecorder from './components/VoiceRecorder'
import Susurro from './components/Susurro'
import SuggestionsPopup from './components/SuggestionsPopup'
import Splash from './components/Splash'
import Settings from './components/Settings'

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

  if (windowType === 'chat') {
    return <MiniChat />
  }

  if (windowType === 'voice') {
    return <VoiceRecorder />
  }

  if (windowType === 'susurro') {
    return <Susurro />
  }

  if (windowType === 'suggestions') {
    return <SuggestionsPopup />
  }

  if (windowType === 'settings') {
    return <Settings />
  }

  return <CommandBar />
}

export default App
