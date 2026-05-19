import React, { useState, useEffect } from 'react';
import { Search, Mic, MessageSquare } from 'lucide-react';
import { electronService } from '../../services/electron';

interface HistoryTabProps {}

const HistoryTab: React.FC<HistoryTabProps> = () => {
  const [view, setView] = useState<'transcriptions' | 'minichat'>('transcriptions');
  const [search, setSearch] = useState('');
  const [historyData, setHistoryData] = useState<{ susurroHistory: any[], chatHistory: any[] }>({ susurroHistory: [], chatHistory: [] });

  useEffect(() => {
    electronService.getHistoryData().then(data => {
      if (data) {
        setHistoryData(data);
      }
    });
  }, []);

  const dataToDisplay = view === 'transcriptions' ? historyData.susurroHistory : historyData.chatHistory;
  
  const filteredData = dataToDisplay.filter(item => {
    if (!search) return true;
    const text = item.title || item.text || item.content || '';
    return text.toLowerCase().includes(search.toLowerCase());
  }).reverse(); // Show newest first

  return (
    <div>
      <div className="tab-header">
        <h2 className="tab-title">Histórico de Sessões</h2>
        <p className="tab-subtitle">Acesse suas conversas e gravações anteriores.</p>
      </div>

      <div className="history-controls">
        <div className="toggle-group">
          <button 
            className={`toggle-btn ${view === 'transcriptions' ? 'active' : ''}`}
            onClick={() => setView('transcriptions')}
          >
            Transcrições
          </button>
          <button 
            className={`toggle-btn ${view === 'minichat' ? 'active' : ''}`}
            onClick={() => setView('minichat')}
          >
            Minichat
          </button>
        </div>

        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar em transcrições..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="history-list">
        {filteredData.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '40px' }}>
            Nenhum histórico encontrado.
          </div>
        ) : (
          filteredData.map((item, index) => {
            const date = new Date(item.timestamp || Date.now());
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            // Simplified rendering for now
            return (
              <div className="history-card" key={item.id || index}>
                <div className="history-icon">
                  {view === 'transcriptions' ? <Mic size={20} /> : <MessageSquare size={20} />}
                </div>
                <div className="history-details">
                  <div className="history-title">
                    {item.title || (item.text ? item.text.substring(0, 30) + '...' : `Sessão de ${formattedDate}`)}
                  </div>
                  <div className="history-meta">
                    📅 {formattedDate} {item.duration ? `• ${item.duration}m` : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryTab;
