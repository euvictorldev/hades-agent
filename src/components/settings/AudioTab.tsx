import React, { useEffect, useState } from 'react';
import { SettingsData } from '../../types/electron';

interface AudioTabProps {
  settings: SettingsData['audio'];
  updateSettings: (updates: Partial<SettingsData['audio']>) => void;
}

const AudioTab: React.FC<AudioTabProps> = ({ settings, updateSettings }) => {
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
  const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);

  // Poll for audio devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true }); // Ask permission
        const devices = await navigator.mediaDevices.enumerateDevices();
        setInputs(devices.filter(d => d.kind === 'audioinput'));
        setOutputs(devices.filter(d => d.kind === 'audiooutput'));
      } catch (err) {
        console.error('Failed to enumerate devices:', err);
      }
    };
    getDevices();
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', getDevices);
  }, []);

  return (
    <div>
      <div className="tab-header">
        <h2 className="tab-title">Áudio e Sons</h2>
        <p className="tab-subtitle">Configure os dispositivos de captura e notificações sonoras.</p>
      </div>

      <div className="section-header">
        <span>⚙️ Dispositivos</span>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-title">Microfone (Entrada)</div>
        </div>
        <div className="setting-control">
          <select 
            className="settings-select"
            aria-label="Microfone de Entrada"
            value={settings.inputDeviceId}
            onChange={(e) => updateSettings({ inputDeviceId: e.target.value })}
          >
            <option value="default">Padrão do Sistema</option>
            {inputs.map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Microfone ${d.deviceId.substring(0, 5)}`}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-title">Saída de Áudio</div>
        </div>
        <div className="setting-control">
          <select 
            className="settings-select"
            aria-label="Saída de Áudio"
            value={settings.outputDeviceId}
            onChange={(e) => updateSettings({ outputDeviceId: e.target.value })}
          >
            <option value="default">Padrão do Sistema</option>
            {outputs.map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Alto-falante ${d.deviceId.substring(0, 5)}`}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="section-header">
        <span>🔊 Captura de Áudio</span>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-title">Captura de Microfone</div>
          <div className="setting-desc">Ativar entrada de áudio do microfone</div>
        </div>
        <div className="setting-control">
          <label className="switch" aria-label="Ativar captura de microfone">
            <input 
              type="checkbox" 
              aria-label="Ativar captura de microfone"
              checked={settings.micEnabled}
              onChange={(e) => updateSettings({ micEnabled: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-title">Sensibilidade/Volume do Microfone</div>
        </div>
        <div className="setting-control">
          <span style={{ fontSize: '13px', color: '#fff' }}>{settings.micVolume}%</span>
          <input 
            type="range" 
            aria-label="Volume do Microfone"
            min="0" max="200" 
            value={settings.micVolume}
            onChange={(e) => updateSettings({ micVolume: Number.parseInt(e.target.value, 10) })}
            style={{ width: '120px' }}
          />
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-title">Áudio do Sistema (Desktop)</div>
          <div className="setting-desc">Capturar sons de outros aplicativos e sistema</div>
        </div>
        <div className="setting-control">
          <label className="switch" aria-label="Ativar áudio do sistema">
            <input 
              type="checkbox" 
              aria-label="Ativar áudio do sistema"
              checked={settings.systemAudioEnabled}
              onChange={(e) => updateSettings({ systemAudioEnabled: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-title">Volume de Outros Áudios</div>
        </div>
        <div className="setting-control">
          <span style={{ fontSize: '13px', color: '#fff' }}>{settings.systemAudioVolume}%</span>
          <input 
            type="range" 
            aria-label="Volume de Outros Áudios"
            min="0" max="200" 
            value={settings.systemAudioVolume}
            onChange={(e) => updateSettings({ systemAudioVolume: Number.parseInt(e.target.value, 10) })}
            style={{ width: '120px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioTab;
