import React, { useState, useEffect } from 'react';
import { SettingsData } from '../../types/electron';
import { Keyboard, RotateCcw, HelpCircle, Check, AlertCircle } from 'lucide-react';
import { electronService } from '../../services/electron';

interface ShortcutsTabProps {
  settings: SettingsData['shortcuts'];
  updateSettings: (updates: Partial<SettingsData['shortcuts']>) => void;
}

const DEFAULTS = {
  toggleCommand: 'Alt+D',
  toggleSettings: 'Alt+S',
  toggleSusurro: 'Alt+B',
  toggleVoice: 'Alt+V'
};

const ShortcutsTab: React.FC<ShortcutsTabProps> = ({ settings = {}, updateSettings }) => {
  const [recordingKey, setRecordingKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ensure default values are populated if missing
  const activeShortcuts = {
    toggleCommand: settings?.toggleCommand || DEFAULTS.toggleCommand,
    toggleSettings: settings?.toggleSettings || DEFAULTS.toggleSettings,
    toggleSusurro: settings?.toggleSusurro || DEFAULTS.toggleSusurro,
    toggleVoice: settings?.toggleVoice || DEFAULTS.toggleVoice
  };

  // Disable global shortcuts when recording, re-enable when stopped or unmounted
  useEffect(() => {
    if (recordingKey) {
      electronService.disableShortcuts();
    } else {
      electronService.enableShortcuts();
    }

    return () => {
      electronService.enableShortcuts();
    };
  }, [recordingKey]);

  useEffect(() => {
    if (!recordingKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Cancel recording
      if (e.key === 'Escape') {
        setRecordingKey(null);
        setErrorMsg(null);
        return;
      }

      // Ignore lone modifier keys
      if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
        return;
      }

      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      if (e.metaKey) modifiers.push('Cmd');

      let key = e.key;
      
      // Standardize key formats for Electron globalShortcut
      if (key === ' ') {
        key = 'Space';
      } else if (key.length === 1) {
        key = key.toUpperCase();
      } else if (key === 'ArrowUp') {
        key = 'Up';
      } else if (key === 'ArrowDown') {
        key = 'Down';
      } else if (key === 'ArrowLeft') {
        key = 'Left';
      } else if (key === 'ArrowRight') {
        key = 'Right';
      }

      const isFunctionKey = /^F[1-9][0-9]?$/.test(key);

      // Validation: Electron globalShortcut demands at least one modifier, or a standalone function key
      if (modifiers.length === 0 && !isFunctionKey) {
        setErrorMsg('Atalhos globais exigem um modificador (Ctrl, Alt, Shift) ou tecla de função (F1-F12).');
        return;
      }

      const newShortcut = [...modifiers, key].join('+');
      
      // Detect duplicate keybindings
      const duplicateKey = Object.entries(activeShortcuts).find(
        ([k, val]) => k !== recordingKey && val.toLowerCase() === newShortcut.toLowerCase()
      );

      if (duplicateKey) {
        setErrorMsg(`Este atalho já está sendo utilizado por outra função.`);
        return;
      }

      // Update and clear recording state
      updateSettings({ [recordingKey]: newShortcut });
      setRecordingKey(null);
      setErrorMsg(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [recordingKey, activeShortcuts, updateSettings]);

  const handleReset = (key: keyof typeof DEFAULTS) => {
    updateSettings({ [key]: DEFAULTS[key] });
    setErrorMsg(null);
  };

  const shortcutItems = [
    {
      key: 'toggleCommand' as const,
      title: 'Barra de Comandos & Chat',
      desc: 'Abre ou esconde o console de comandos rápidos e o painel de chat principal.',
    },
    {
      key: 'toggleSettings' as const,
      title: 'Menu de Configurações',
      desc: 'Abre ou esconde o painel central de configurações gerais e atalhos.',
    },
    {
      key: 'toggleSusurro' as const,
      title: 'Transcrição Live (Susurro)',
      desc: 'Ativa ou desativa a captura e transcrição de áudio em tempo real.',
    },
    {
      key: 'toggleVoice' as const,
      title: 'Comando de Voz Direto',
      desc: 'Ativa a captura imediata de comandos de voz sem abrir a barra gráfica.',
    }
  ];

  return (
    <div className="shortcuts-tab-container">
      <div className="tab-header">
        <h2 className="tab-title">Teclas de Atalho</h2>
        <p className="tab-subtitle">Personalize os atalhos globais de teclado para controlar o Hades de qualquer lugar do sistema.</p>
      </div>

      <div className="section-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Keyboard size={16} /> Atalhos Globais
        </span>
      </div>

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '20px'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="shortcuts-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {shortcutItems.map((item) => {
          const isRecording = recordingKey === item.key;
          const value = activeShortcuts[item.key];
          const isModified = value !== DEFAULTS[item.key];

          return (
            <div 
              key={item.key} 
              className="setting-row"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '10px',
                padding: '16px 20px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div className="setting-info" style={{ paddingRight: '16px' }}>
                <div className="setting-title" style={{ fontSize: '15px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{item.title}</span>
                  {isModified && (
                    <span style={{
                      fontSize: '10px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 500
                    }}>
                      Customizado
                    </span>
                  )}
                </div>
                <div className="setting-desc" style={{ marginTop: '4px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                  {item.desc}
                </div>
              </div>

              <div className="setting-control" style={{ gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setRecordingKey(isRecording ? null : item.key);
                  }}
                  className={`settings-input-shortcut ${isRecording ? 'recording' : ''}`}
                  style={{
                    background: isRecording ? 'rgba(220, 38, 38, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: isRecording ? '1px solid #dc2626' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: isRecording ? '#ef4444' : '#fff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minWidth: '150px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: isRecording ? '0 0 12px rgba(220, 38, 38, 0.3)' : 'none'
                  }}
                >
                  {isRecording ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <span className="recording-dot" style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        display: 'inline-block'
                      }} />
                      Aguardando teclas...
                    </span>
                  ) : (
                    value
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleReset(item.key)}
                  disabled={!isModified || isRecording}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: isModified && !isRecording ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.2)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: isModified && !isRecording ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title="Restaurar padrão"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '32px',
        background: 'rgba(220, 38, 38, 0.05)',
        border: '1px solid rgba(220, 38, 38, 0.1)',
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <HelpCircle size={18} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.5' }}>
          <strong>Como alterar um atalho:</strong> Clique no botão do atalho desejado para iniciar a gravação. Pressione a combinação de teclas no teclado (ex: <code>Alt+Shift+H</code>). O sistema validará e salvará o novo atalho automaticamente. Para cancelar, pressione <code>Esc</code>.
        </div>
      </div>
    </div>
  );
};

export default ShortcutsTab;
