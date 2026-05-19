import React from 'react';
import { X } from 'lucide-react';
import { electronService } from '../services/electron';

const TitleBar: React.FC = () => {
  const handleClose = () => {
    electronService.closeWindow();
  };

  return (
    <header className="title-bar">
      <div className="drag-region" style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src="/icon/icon.png" 
          alt="Hades Icon" 
          style={{ 
            width: '16px', 
            height: '16px', 
            marginRight: '8px', 
            marginLeft: '8px',
            borderRadius: '2px 8px 2px 8px', 
            border: '1px solid #dc2626',
            objectFit: 'cover'
          }} 
        />
        <span className="app-title">Hades-Agent</span>
      </div>
      <div className="window-controls">
        <button onClick={handleClose} className="close-btn" title="Fechar para a bandeja">
          <X size={14} />
        </button>
      </div>
    </header>
  );
};

export default TitleBar;
