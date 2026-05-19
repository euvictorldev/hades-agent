import CommandBar from './components/CommandBar'
import MiniChat from './components/MiniChat'
import VoiceRecorder from './components/VoiceRecorder'
import Susurro from './components/Susurro'
import SuggestionsPopup from './components/SuggestionsPopup'
import Splash from './components/Splash'
import Settings from './components/Settings'

import SusurroSetup from './components/SusurroSetup'

const App: React.FC = () => {
  const urlParams = new URLSearchParams(globalThis.location.search)
  const windowType = urlParams.get('window')

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

  if (windowType === 'susurro-setup') {
    return <SusurroSetup />
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
