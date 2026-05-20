import React, { useState, useEffect } from 'react';
import { ChevronRight, Camera, X, Paperclip, Plus, ChevronDown, Check } from 'lucide-react';
import { useCommandBar } from '../hooks/useCommandBar';
import { electronService } from '../services/electron';
import { MODELS } from '../constants/models';

/**
 * CommandBar component - A sleek, minimal input bar for AI commands.
 * Supports text input, local image uploads via (+), screen captures, and live model selection.
 */
const CommandBar: React.FC = () => {
  const {
    query,
    setQuery,
    attachedImage,
    setAttachedImage,
    inputRef,
    containerRef,
    MAX_CHARS,
    handleCapture,
    handleKeyDown,
    handlePaste,
    removeAttachment,
    isModelDropdownOpen,
    setIsModelDropdownOpen
  } = useCommandBar();

  const [activeModel, setActiveModel] = useState<string>('gemini-2.5-flash');

  // Sync settings and setup listeners on mount
  useEffect(() => {
    electronService.getSettings().then(settings => {
      if (settings?.general?.minichatModel) {
        setActiveModel(settings.general.minichatModel);
      }
    });

    const unsubscribe = electronService.onSettingsUpdated((settings) => {
      if (settings?.general?.minichatModel) {
        setActiveModel(settings.general.minichatModel);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Close dropdown on clicking outside
  useEffect(() => {
    if (!isModelDropdownOpen) return;
    const handleGlobalClick = () => {
      setIsModelDropdownOpen(false);
    };
    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [isModelDropdownOpen]);

  const handleSelectModel = async (modelId: string) => {
    setActiveModel(modelId);
    setIsModelDropdownOpen(false);
    try {
      const settings = await electronService.getSettings();
      if (settings) {
        settings.general.minichatModel = modelId;
        await electronService.saveSettings(settings);
      }
    } catch (err) {
      console.error('Failed to save model selection from command bar:', err);
    }
  };

  const handleFileOpen = async () => {
    const base64 = await electronService.openFileDialog();
    if (base64) {
      setAttachedImage(base64);
      // Return focus to the text input so the user can type immediately
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const activeModelData = MODELS.find(m => m.id === activeModel);

  return (
    <div className="app-container command-mode" ref={containerRef}>
      <div className="command-main">
        <div className="command-icon">
          <ChevronRight size={20} color="#dc2626" />
        </div>
        
        <div className="input-wrapper" style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
          <textarea
            ref={inputRef}
            placeholder="O que você precisa?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className="command-input"
            rows={1}
            autoFocus
            maxLength={MAX_CHARS}
            style={{ 
              width: '100%', 
              paddingRight: attachedImage ? '180px' : '40px',
              transition: 'padding-right 0.2s ease',
              lineHeight: '24px',
              marginTop: '2px'
            }}
          />

          {attachedImage && (
            <AttachmentIndicator 
              fileName="imagem.png" 
              onRemove={removeAttachment} 
            />
          )}
        </div>
      </div>
      
      <div className="command-footer">
        {/* + File Picker Button (Far Left) */}
        <button 
          type="button" 
          className="footer-btn" 
          onClick={handleFileOpen}
          style={{ padding: '6px 10px' }}
          title="Upload Imagem"
        >
          <Plus size={14} color="#dc2626" />
        </button>

        {/* Screenshot / Capture Screen Button */}
        <button 
          type="button" 
          className="footer-btn" 
          onClick={handleCapture}
          style={{ padding: '6px 10px' }}
          title="Capturar Tela (Ctrl+E)"
        >
          <Camera size={14} color="#dc2626" />
        </button>

        {/* Active Model Selector Pill */}
        <button 
          type="button"
          className="footer-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsModelDropdownOpen(!isModelDropdownOpen);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            background: 'rgba(220, 38, 38, 0.04)',
            border: '1px solid rgba(220, 38, 38, 0.12)'
          }}
          title="Selecionar Modelo"
        >
          <span className="keycap-text" style={{ fontSize: '11px' }}>
            {activeModelData?.name || activeModel}
          </span>
          <ChevronDown 
            size={12} 
            color="rgba(255, 255, 255, 0.4)" 
            style={{ 
              transform: isModelDropdownOpen ? 'rotate(180deg)' : 'none', 
              transition: 'transform 0.2s' 
            }} 
          />
        </button>

        {/* Model Selection Dropdown Menu */}
        {isModelDropdownOpen && (
          <div 
            className="model-dropdown"
            role="menu"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '100%',
              left: '18px',
              marginTop: '8px',
              width: '290px',
              background: 'rgba(8, 4, 4, 0.96)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(220, 38, 38, 0.25)',
              borderRadius: '8px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65), 0 0 15px rgba(220, 38, 38, 0.08)',
              zIndex: 100,
              padding: '6px 0',
              animation: 'appear 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {MODELS.map((m) => {
              const isSelected = m.id === activeModel;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`dropdown-item ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectModel(m.id)}
                  style={{
                    width: '100%',
                    background: isSelected ? 'rgba(220, 38, 38, 0.15)' : 'transparent',
                    border: 'none',
                    borderLeft: isSelected ? '3px solid #dc2626' : '3px solid transparent',
                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{m.name}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {m.tag && (() => {
                      let bg = 'rgba(220, 38, 38, 0.15)';
                      let border = '1px solid rgba(220, 38, 38, 0.3)';
                      let color = '#ef4444';
                      
                      if (m.tag === 'Thinking') {
                        bg = 'rgba(245, 158, 11, 0.15)';
                        border = '1px solid rgba(245, 158, 11, 0.3)';
                        color = '#f59e0b';
                      }
                      
                      return (
                        <span style={{
                          background: bg,
                          border: border,
                          color: color,
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          {m.tag}
                        </span>
                      );
                    })()}
                    {isSelected && <Check size={12} color="#ef4444" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Character Counter */}
        <div className="char-counter" style={{ 
          position: 'absolute',
          right: '24px',
          fontSize: '10px', 
          color: query.length > (MAX_CHARS * 0.9) ? '#ff4d4d' : 'rgba(220, 38, 38, 0.4)',
          fontWeight: 600,
          letterSpacing: '0.5px'
        }}>
          {query.length} / {MAX_CHARS}
        </div>
      </div>
    </div>
  );
};

/**
 * Sub-component for showing attached files.
 */
const AttachmentIndicator: React.FC<{ fileName: string; onRemove: () => void }> = ({ fileName, onRemove }) => (
  <div className="attachment-indicator" style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '3px 8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.15)',
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 30,
    pointerEvents: 'auto',
    animation: 'appear 0.2s ease-out'
  }}>
    <Paperclip size={12} />
    <span>{fileName}</span>
    <button 
      type="button"
      className="remove-attachment-btn"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove();
      }}
      style={{ 
        background: 'rgba(255,255,255,0.15)', 
        border: 'none', 
        color: 'rgba(255,255,255,0.8)', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '4px',
        borderRadius: '4px',
        marginLeft: '6px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none'
      }}
    >
      <X size={12} />
    </button>
  </div>
);

export default CommandBar;
