import React from 'react';
import { X, Save, Loader } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { electronService } from '../services/electron';
import '../styles/settings.css';

import SettingsSidebar from './settings/SettingsSidebar';
import HistoryTab from './settings/HistoryTab';
import AudioTab from './settings/AudioTab';
import GeneralTab from './settings/GeneralTab';
import ShortcutsTab from './settings/ShortcutsTab';

const Settings: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    settings,
    isLoading,
    isSaving,
    updateAudioSettings,
    updateGeneralSettings,
    updateShortcutsSettings,
    saveAll
  } = useSettings();

  const handleClose = () => {
    electronService.closeWindow();
  };

  if (isLoading || !settings) {
    return (
      <div className="settings-window" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Loader className="animate-spin" size={32} color="#dc2626" />
      </div>
    );
  }

  return (
    <div className="settings-window">
      <div className="settings-drag-area">
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
          HADES AGENT
        </div>
        <button className="settings-close-btn" onClick={handleClose}>
          <X size={16} />
        </button>
      </div>

      <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="settings-content-wrapper">
        <div className="settings-content">
          {activeTab === 'history' && (
            <HistoryTab />
          )}
          
          {activeTab === 'audio' && (
            <AudioTab 
              settings={settings.audio} 
              updateSettings={updateAudioSettings} 
            />
          )}
          
          {activeTab === 'general' && (
            <GeneralTab 
              settings={settings.general} 
              updateSettings={updateGeneralSettings} 
            />
          )}

          {activeTab === 'shortcuts' && (
            <ShortcutsTab 
              settings={settings.shortcuts} 
              updateSettings={updateShortcutsSettings} 
            />
          )}
        </div>

        <div className="settings-footer">
          <button 
            className="btn-save" 
            onClick={saveAll}
            disabled={isSaving}
          >
            {isSaving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
            <span>{isSaving ? 'Salvando...' : 'Salvar configurações'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
