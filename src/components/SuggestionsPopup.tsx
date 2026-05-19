import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles } from 'lucide-react';
import { electronService } from '../services/electron';

const SuggestionsPopup: React.FC = () => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const unsubscribe = electronService.onNewSuggestion((text: string) => {
      setSuggestion(text);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (suggestion === null) return null;

  return (
    <aside
      className={`suggestions-popup ${isHovered ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Sugestão do assistente"
    >
      <div className="popup-icon">
        <Sparkles size={18} color="#60a5fa" />
      </div>
      <div className="popup-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {suggestion}
        </ReactMarkdown>
      </div>
    </aside>
  );
};

export default SuggestionsPopup
