import React from 'react';
import { ChevronRight, Camera, X, Paperclip } from 'lucide-react';
import { useCommandBar } from '../hooks/useCommandBar';
import { electronService } from '../services/electron';

/**
 * CommandBar component - A sleek, minimal input bar for AI commands.
 * Supports text input, screen capture attachments, and global shortcuts.
 */
const CommandBar: React.FC = () => {
  const {
    query,
    setQuery,
    attachedImage,
    inputRef,
    containerRef,
    MAX_CHARS,
    handleCapture,
    handleSend,
    handleKeyDown,
    handlePaste,
    removeAttachment
  } = useCommandBar();

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
              fileName="screenshot.png" 
              onRemove={removeAttachment} 
            />
          )}
        </div>
      </div>
      
      <div className="command-footer">
        <FooterButton 
          icon={<Camera size={12} color="#dc2626" />} 
          label="Screenshot (Ctrl+E)" 
          onClick={handleCapture} 
        />
        
        <FooterButton 
          label="Enviar" 
          keycap="Enter"
          onClick={handleSend} 
        />
        
        <FooterButton 
          label="Cancelar" 
          keycap="Esc"
          onClick={() => {
            electronService.closeWindow();
          }} 
        />

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
  )
}

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
        e.preventDefault()
        e.stopPropagation()
        onRemove()
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
)

/**
 * Sub-component for footer buttons with optional icons or keycaps.
 */
const FooterButton: React.FC<{ 
  label: string; 
  onClick: () => void; 
  icon?: React.ReactNode; 
  keycap?: string;
}> = ({ label, onClick, icon, keycap }) => (
  <button 
    type="button"
    className="footer-btn" 
    onClick={onClick}
  >
    {(icon || keycap) && (
      <span className="keycap-box" style={{ color: '#dc2626' }}>
        {icon || keycap}
      </span>
    )}
    <span className="keycap-text">{label}</span>
  </button>
)

export default CommandBar

