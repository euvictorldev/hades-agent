import React, { useRef, useEffect } from 'react';
import { Settings2, Pin, Minus, Plus, Activity, Type, Languages, Minimize2, Maximize2, Menu, MessageSquare, Mic } from 'lucide-react';
import { MenuView, Persona } from '../../types';
import { formatTime } from '../../utils/formatters';
import { electronService } from '../../services/electron';
import { SusurroMenu } from './SusurroMenu';

interface SusurroHeaderProps {
  timer: number;
  tokens: number;
  isTranscribing: boolean;
  isConnecting: boolean;
  isGlobalTranslationEnabled: boolean;
  targetLanguage: string;
  targetLanguageLabel: string;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  menuView: MenuView;
  setMenuView: (view: MenuView) => void;
  setTargetLanguage: (lang: string) => void;
  setTargetLanguageLabel: (label: string) => void;
  handleMinimize: () => void;
  handleToggleGlobalTranslation: () => void;
  isSuggestionsEnabled: boolean;
  setIsSuggestionsEnabled: (enabled: boolean) => void;
  selectedPersona: Persona | null;
  setSelectedPersona: (persona: Persona | null) => void;
  personas: Persona[];
  isCreatingPersona: boolean;
  setIsCreatingPersona: (creating: boolean) => void;
  newPersonaName: string;
  setNewPersonaName: (name: string) => void;
  newPersonaPrompt: string;
  setNewPersonaPrompt: (prompt: string) => void;
  handleSavePersona: () => void;
  handleDeletePersona: (id: string) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  fontSize: number;
  activeMode?: 'chat' | 'susurro';
  onSwitchMode?: (mode: 'chat' | 'susurro') => void;
  currentSessionId?: string | null;
  isClosingSession?: boolean;
  onCloseSession: () => Promise<void> | void;
}

const SessionList: React.FC<{ sessions: any[], setIsMenuOpen: (o: boolean) => void, currentSessionId?: string | null }> = ({ sessions, setIsMenuOpen, currentSessionId }) => (
  <div style={{ marginTop: '12px' }}>
    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', paddingLeft: '4px', marginBottom: '8px', letterSpacing: '0.5px' }}>
      Histórico de Transcrições
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {sessions.map(session => (
        <button
          key={session.id}
          onClick={() => {
            // TODO: Ensure susurro can load previous sessions if needed, or just switch to it.
            // Susurro doesn't currently support loading past transcripts actively into the view,
            // but we can dispatch an event if it ever does.
            globalThis.dispatchEvent(new CustomEvent('load-susurro-session', { detail: { id: session.id } }));
            setIsMenuOpen(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: session.id === currentSessionId ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            color: session.id === currentSessionId ? '#fff' : '#ccc',
            border: session.id === currentSessionId ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            padding: '8px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '13px',
            width: '100%',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = session.id === currentSessionId ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#fff';
          }}
          onFocus={(e) => {
            e.currentTarget.style.background = session.id === currentSessionId ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = session.id === currentSessionId ? 'rgba(255, 255, 255, 0.15)' : 'transparent';
            e.currentTarget.style.color = session.id === currentSessionId ? '#fff' : '#ccc';
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = session.id === currentSessionId ? 'rgba(255, 255, 255, 0.15)' : 'transparent';
            e.currentTarget.style.color = session.id === currentSessionId ? '#fff' : '#ccc';
          }}
        >
          <Mic size={14} style={{ opacity: 0.7, flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {session.title || 'Sessão sem nome'}
          </span>
        </button>
      ))}
    </div>
  </div>
);

/**
 * SusurroHeader: Contains status indicators, session controls, and settings access.
 */
export const SusurroHeader: React.FC<SusurroHeaderProps> = (props) => {
  const settingsRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [sessions, setSessions] = React.useState<any[]>([]);

  // Fetch history when menu opens
  useEffect(() => {
    if (isMenuOpen) {
      electronService.getHistoryData().then((data: any) => {
        if (data?.susurroHistory) {
          // Sort by timestamp descending
          const sorted = data.susurroHistory.sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setSessions(sorted);
        }
      });
    }
  }, [isMenuOpen]);

  // Close settings menu when clicking outside the settings container
  useEffect(() => {
    if (!props.isSettingsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        props.setIsSettingsOpen(false);
        props.setMenuView('main');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [props.isSettingsOpen]);

  return (
    <div className="susurro-header">
      <div className="header-left">
        <div style={{ position: 'relative', WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button 
            className="action-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Menu"
            style={{ color: '#dc2626', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' }}
          >
            <Menu size={16} />
          </button>
        </div>
        
        {/* Render sidebar inside the header wrapper */}
        <div 
          className={`settings-overlay ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if(e.key === 'Enter') setIsMenuOpen(false); }}
        />

        <div className={`sidebar-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '10px 4px 0' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu Principal</span>
            <button className="action-btn" onClick={() => setIsMenuOpen(false)} style={{ padding: '6px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 4px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={async () => {
                  if (props.isClosingSession) return;
                  await props.onCloseSession();
                  setIsMenuOpen(false);
                }}
                disabled={props.isClosingSession}
                style={{
                  display: 'flex',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(220, 38, 38, 0.1)',
                  color: '#dc2626',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)'}
                onFocus={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)'}
                onMouseOut={(e) => !props.isClosingSession && (e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)')}
                onBlur={(e) => !props.isClosingSession && (e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)')}
              >
                {props.isClosingSession ? <Activity size={16} className="pulse" /> : <Plus size={16} />} 
                {props.isClosingSession ? 'Salvando...' : 'Nova Sessão'}
              </button>
            </div>
            
            {sessions.length > 0 && <SessionList sessions={sessions} setIsMenuOpen={setIsMenuOpen} currentSessionId={props.currentSessionId} />}
          </div>
        </div>

        {(props.isTranscribing || props.isConnecting) && (
          <div className="title-with-timer">
            <div className="status-indicator active" style={{ fontSize: '14px', marginRight: '6px' }}>
              <Activity size={16} className="pulse" />
              <span style={{ fontWeight: 600, color: '#ef4444' }}>
                {props.isTranscribing ? "Escutando..." : "Conectando..."}
              </span>
            </div>
          </div>
        )}
        
        {props.onSwitchMode && (
          <div className="mode-switcher" style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '2px', marginLeft: '12px', WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <button 
              onClick={() => props.onSwitchMode!('chat')} 
              style={{
                padding: '4px 12px',
                borderRadius: '10px',
                border: 'none',
                background: props.activeMode === 'chat' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: props.activeMode === 'chat' ? '#fff' : '#888',
                fontSize: '12px',
                fontWeight: props.activeMode === 'chat' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Chat
            </button>
            <button 
              onClick={() => props.onSwitchMode!('susurro')} 
              style={{
                padding: '4px 12px',
                borderRadius: '10px',
                border: 'none',
                background: props.activeMode === 'susurro' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: props.activeMode === 'susurro' ? '#fff' : '#888',
                fontSize: '12px',
                fontWeight: props.activeMode === 'susurro' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Susurro
            </button>
          </div>
        )}
      </div>

      <div className="header-actions">
        <button
          className={`action-btn global-translate-btn ${props.isGlobalTranslationEnabled ? 'active' : ''}`}
          onClick={props.handleToggleGlobalTranslation}
          title="Tradução Global"
        >
          <Languages size={16} />
        </button>


        <div className="info-wrapper">
          <button className="action-btn info-btn" title="Uso do Modelo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </button>
          <div className="usage-popup">
            {props.tokens.toLocaleString()} tokens
          </div>
        </div>

        <div className="settings-container" ref={settingsRef}>
          <button className={`action-btn settings-btn ${props.isSettingsOpen ? 'active' : ''}`} onClick={() => props.setIsSettingsOpen(!props.isSettingsOpen)} title="Configurações">
            <Settings2 size={16} />
          </button>
          {props.isSettingsOpen && (
            <SusurroMenu
              menuView={props.menuView}
              setMenuView={props.setMenuView}
              targetLanguage={props.targetLanguage}
              targetLanguageLabel={props.targetLanguageLabel}
              setTargetLanguage={props.setTargetLanguage}
              setTargetLanguageLabel={props.setTargetLanguageLabel}
              isSuggestionsEnabled={props.isSuggestionsEnabled}
              setIsSuggestionsEnabled={props.setIsSuggestionsEnabled}
              selectedPersona={props.selectedPersona}
              setSelectedPersona={props.setSelectedPersona}
              personas={props.personas}
              isCreatingPersona={props.isCreatingPersona}
              setIsCreatingPersona={props.setIsCreatingPersona}
              newPersonaName={props.newPersonaName}
              setNewPersonaName={props.setNewPersonaName}
              newPersonaPrompt={props.newPersonaPrompt}
              setNewPersonaPrompt={props.setNewPersonaPrompt}
              handleSavePersona={props.handleSavePersona}
              handleDeletePersona={props.handleDeletePersona}
            />
          )}
        </div>



        <div className="font-controls" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px', WebkitAppRegion: 'no-drag' as React.CSSProperties }}>
          <button className="action-btn" onClick={props.decreaseFontSize} title="Diminuir fonte">
            <Minus size={14} />
          </button>
          <div className="font-size-indicator" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#888', fontWeight: 600, padding: '0 4px', minWidth: '32px', justifyContent: 'center' }}>
            <Type size={10} style={{ opacity: 0.5 }} />
            <span>{props.fontSize}</span>
          </div>
          <button className="action-btn" onClick={props.increaseFontSize} title="Aumentar fonte">
            <Plus size={14} />
          </button>
        </div>

        <button 
          className="action-btn close-btn" 
          onClick={props.handleMinimize}
          title="Minimizar"
        >
          <Minus size={16} />
        </button>
      </div>
    </div>
  );
};
