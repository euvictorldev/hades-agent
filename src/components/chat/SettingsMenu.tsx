import React from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { MODELS } from '../../constants';

interface SettingsMenuProps {
  view: 'main' | 'models';
  currentModel: string;
  onSetView: (view: 'main' | 'models') => void;
  onSelectModel: (modelId: string) => void;
  onClose: () => void;
}

/**
 * Settings menu for model selection and other configurations.
 */
export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  view,
  currentModel,
  onSetView,
  onSelectModel,
  onClose
}) => {
  return (
    <div className="settings-menu">
      {view === 'main' ? (
        <>
          <div className="menu-header">Settings</div>
          <button className="menu-item" onClick={() => onSetView('models')}>
            <span>Modelos</span>
            <ChevronLeft size={14} className="submenu-icon rotate-180" />
          </button>
        </>
      ) : (
        <>
          <button className="menu-header back-header" onClick={() => onSetView('main')}>
            <ChevronLeft size={14} />
            <span>Select Model</span>
          </button>
          <div className="models-list">
            {MODELS.map(m => (
              <button 
                key={m.id} 
                className={`menu-item ${currentModel === m.id ? 'active' : ''}`} 
                onClick={() => {
                  onSelectModel(m.id);
                  onClose();
                  onSetView('main');
                }}
              >
                {m.name}
                {currentModel === m.id && <Check size={12} className="check-icon" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
