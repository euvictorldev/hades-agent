import React, { useState } from 'react';
import { SettingsData } from '../../types/electron';
import { MODELS } from '../../constants/models';
import { Eye, EyeOff } from 'lucide-react';

interface GeneralTabProps {
  settings: SettingsData['general'];
  updateSettings: (updates: Partial<SettingsData['general']>) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ settings, updateSettings }) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div>
      <div className="tab-header">
        <h2 className="tab-title">Configurações</h2>
        <p className="tab-subtitle">Ajuste modelos de IA, privacidade e chaves de acesso.</p>
      </div>

      <div className="section-header">
        <span>🔑 Chaves de API</span>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-title">Google AI Studio</div>
        </div>
        <div className="setting-control" style={{ position: 'relative' }}>
          <input 
            type={showKey ? "text" : "password"}
            className="settings-input"
            aria-label="API Key do Google"
            placeholder="Insira sua API Key do Google..."
            value={settings.apiKey}
            onChange={(e) => updateSettings({ apiKey: e.target.value })}
            style={{ paddingRight: '40px' }}
          />
          <button 
            type="button"
            aria-label={showKey ? "Ocultar chave" : "Mostrar chave"}
            onClick={() => setShowKey(!showKey)}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="section-header">
        <span>🤖 Modelos em Uso</span>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-title">Modelo do Minichat (Raciocínio)</div>
        </div>
        <div className="setting-control">
          <select 
            className="settings-select"
            aria-label="Modelo do Minichat"
            value={settings.minichatModel}
            onChange={(e) => updateSettings({ minichatModel: e.target.value })}
          >
            {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-title">Gravador (Speech-to-Text)</div>
        </div>
        <div className="setting-control">
          <select 
            className="settings-select"
            aria-label="Modelo do Gravador de Voz"
            value={settings.sttModel}
            onChange={(e) => updateSettings({ sttModel: e.target.value })}
          >
            {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-title">Transcrição Completa</div>
        </div>
        <div className="setting-control">
          <select 
            className="settings-select"
            aria-label="Modelo de Transcrição Completa"
            value={settings.fullTranscriptionModel}
            onChange={(e) => updateSettings({ fullTranscriptionModel: e.target.value })}
          >
            {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div className="section-header">
        <span>🛡️ Privacidade</span>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-title">Stealth Mode (Modo Furtivo)</div>
          <div className="setting-desc">Esse modo esconde o aplicativo de gravadores de telas como Discord, OBS e outros.</div>
        </div>
        <div className="setting-control">
          <label className="switch" aria-label="Stealth Mode">
            <input 
              type="checkbox" 
              aria-label="Stealth Mode"
              checked={settings.stealthMode}
              onChange={(e) => updateSettings({ stealthMode: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
