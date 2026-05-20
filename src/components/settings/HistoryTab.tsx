import React, { useState, useEffect, useCallback } from 'react';
import { Search, Mic, MessageSquare, Clock, Hash, ArrowLeft, Copy, Check, Image } from 'lucide-react';
import { electronService } from '../../services/electron';
import { MessageBubble } from '../chat/MessageBubble';
import { ChatMessage } from '../../types';

interface Session {
  id: string;
  title: string;
  type: 'minichat' | 'susurro';
  timestamp: string;
  messages: ChatMessage[];
}

// ─── Session Detail View ─────────────────────────────────────────────────────
const SessionDetail: React.FC<{ session: Session; onBack: () => void }> = ({ session, onBack }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, id: string) => {
    electronService.copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '13px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
        >
          <ArrowLeft size={14} /> Voltar
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.title}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={10} /> {formatDate(session.timestamp)}
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <Hash size={10} /> {session.messages.length} mensagens
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="messages-list"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {session.messages.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '40px', fontSize: '13px' }}>
            Nenhuma mensagem nesta sessão.
          </div>
        ) : (
          session.messages.map((msg, i) => (
            <div key={msg.id || i}>
              {/* Timestamp between messages */}
              {msg.timestamp && (
                <div style={{
                  textAlign: 'center',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.2)',
                  margin: '4px 0',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <MessageBubble message={msg} copiedId={copiedId} onCopy={handleCopy} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── Main History Tab ────────────────────────────────────────────────────────
const HistoryTab: React.FC = () => {
  const [view, setView] = useState<'transcriptions' | 'minichat'>('minichat');
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<{ susurroHistory: Session[], chatHistory: Session[] }>({
    susurroHistory: [],
    chatHistory: []
  });

  useEffect(() => {
    const fetchSessions = () => {
      electronService.getHistoryData().then(data => {
        if (data) setSessions(data as any);
      });
    };
    
    fetchSessions(); // initial load
    const interval = setInterval(fetchSessions, 2000);
    return () => clearInterval(interval);
  }, []);

  const dataToDisplay = (view === 'transcriptions' ? sessions.susurroHistory : sessions.chatHistory)
    .filter(session => !search || session.title?.toLowerCase().includes(search.toLowerCase()))
    .slice()
    .reverse();

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // If a session is selected, show its detail view
  if (selectedSession) {
    return <SessionDetail session={selectedSession} onBack={() => setSelectedSession(null)} />;
  }

  return (
    <div>
      <div className="tab-header">
        <h2 className="tab-title">Histórico de Sessões</h2>
        <p className="tab-subtitle">Conversas e transcrições arquivadas automaticamente.</p>
      </div>

      <div className="history-controls">
        <div className="toggle-group">
          <button
            className={`toggle-btn ${view === 'minichat' ? 'active' : ''}`}
            onClick={() => setView('minichat')}
          >
            <MessageSquare size={13} style={{ marginRight: 4 }} />
            Minichat
          </button>
          <button
            className={`toggle-btn ${view === 'transcriptions' ? 'active' : ''}`}
            onClick={() => setView('transcriptions')}
          >
            <Mic size={13} style={{ marginRight: 4 }} />
            Susurro
          </button>
        </div>

        <div className="search-box">
          <Search size={14} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar sessões..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="history-list">
        {dataToDisplay.length === 0 ? (
          <div style={{
            color: 'rgba(255,255,255,0.3)',
            textAlign: 'center',
            marginTop: '48px',
            fontSize: '13px',
            lineHeight: '2',
          }}>
            {search
              ? 'Nenhuma sessão encontrada.'
              : 'Nenhuma sessão arquivada ainda.\nInicie uma conversa e clique em + para criar uma nova sessão.'}
          </div>
        ) : (
          dataToDisplay.map((session, index) => {
            const msgCount = Array.isArray(session.messages) ? session.messages.length : 0;
            // Check if session has any images
            const hasImages = Array.isArray(session.messages) && session.messages.some(m => m.image);

            return (
              <div
                className="history-card"
                key={session.id || index}
                onClick={() => setSelectedSession(session)}
                style={{ cursor: 'pointer' }}
              >
                <div className="history-icon">
                  {view === 'transcriptions' ? <Mic size={18} /> : <MessageSquare size={18} />}
                </div>
                <div className="history-details">
                  <div className="history-title">{session.title || `Sessão ${index + 1}`}</div>
                  <div className="history-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} />
                      {formatDate(session.timestamp)}
                    </span>
                    {msgCount > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', opacity: 0.6 }}>
                        <Hash size={10} />
                        {msgCount} {msgCount === 1 ? 'msg' : 'msgs'}
                      </span>
                    )}
                    {hasImages && (
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Image size={11} /> imagens
                      </span>
                    )}
                  </div>
                </div>
                {/* Arrow hint */}
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '18px', marginLeft: 'auto', flexShrink: 0 }}>›</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryTab;
