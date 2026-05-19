import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, AlertCircle, Loader2, Globe } from 'lucide-react';
import { electronService } from '../services/electron';

/**
 * SusurroSetup: Handles the one-time download and configuration of local AI models.
 */
const SusurroSetup: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Pronto para baixar');
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingInternet, setIsCheckingInternet] = useState(false);

  const getIcon = () => {
    if (error) return <AlertCircle size={48} color="#ef4444" />;
    if (isComplete) return <CheckCircle size={48} color="#10b981" className="animate-bounce" />;
    if (isStarted) return <Download size={48} color="#6366f1" className="animate-pulse" />;
    if (isCheckingInternet) return <Loader2 size={48} color="#6366f1" className="animate-spin" />;
    return <Globe size={48} color="#6366f1" />;
  };

  const getTitle = () => {
    if (isComplete) return 'Tudo Pronto!';
    if (error) return 'Algo deu errado';
    if (isStarted) return 'Baixando Recursos';
    return 'Tradução Local';
  };

  const getDescription = () => {
    if (isComplete) return 'O modelo foi instalado com sucesso.';
    if (error) return error;
    if (isStarted) return 'Estamos baixando o modelo de tradução (600MB).';
    return 'Para usar o tradutor, precisamos baixar um pacote de inteligência artificial.';
  };

  useEffect(() => {
    if (!isStarted) return;

    const handleProgress = (data: any) => {
      if (data.status === 'progress') {
        let raw = 0;
        if (typeof data.progress === 'number') {
          raw = data.progress;
        } else if (data.total > 0) {
          raw = (data.loaded / data.total) * 100;
        }
        
        const p = Math.min(100, Math.max(0, Math.round(raw)));
        setProgress(prev => Math.max(p, prev));
        setStatus(`Baixando: ${data.file || 'modelo...'} (${p}%)`);
      } else if (data.status === 'done' || data.status === 'ready' || data.progress === 100) {
        if (data.progress === 100) setProgress(100);
        if (data.status === 'ready') handleComplete();
      }
    };

    const handleComplete = () => {
      setIsComplete(true); setStatus('Instalação concluída!'); setProgress(100);
      setTimeout(() => {
        electronService.sendSusurroSetupComplete();
        electronService.closeWindow();
      }, 1500);
    };

    const handleError = (err: string) => { setError(err); setStatus('Erro na instalação'); setIsStarted(false); };

    const r1 = electronService.onTranslationDownloadProgress(handleProgress);
    const r2 = electronService.onTranslationDownloadStatus(s => setStatus(s));
    const r3 = electronService.onTranslationDownloadComplete(handleComplete);
    const r4 = electronService.onTranslationDownloadError(handleError);

    electronService.downloadTranslationModel();

    return () => { r1(); r2(); r3(); r4(); };
  }, [isStarted]);

  const startDownload = async () => {
    setError(null); setIsCheckingInternet(true); setStatus('Verificando conexão...');
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      await fetch('https://www.google.com', { mode: 'no-cors', signal: controller.signal });
      clearTimeout(id);
      setIsCheckingInternet(false); setIsStarted(true); setStatus('Iniciando...');
    } catch {
      setError('Sem conexão estável. Verifique seu Wi-Fi.');
      setIsCheckingInternet(false); setStatus('Erro de conexão');
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card glassmorphic-susurro">
        <div className="setup-icon">
          {getIcon()}
        </div>
        
        <h2 className="setup-title">{getTitle()}</h2>
        
        <p className="setup-description">{getDescription()}</p>

        {(isStarted || isComplete) && (
          <div className="progress-section">
            <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
            <div className="status-row"><span>{status}</span><span>{progress}%</span></div>
          </div>
        )}

        {!isStarted && !isComplete && (
          <button onClick={startDownload} className="start-btn" disabled={isCheckingInternet}>
            {isCheckingInternet ? 'Verificando...' : 'Baixar e Configurar'}
          </button>
        )}

        <div className="setup-footer">
          {isComplete ? (
            <div className="completion-badge">
              <Loader2 size={14} className="animate-spin" />
              <span>Iniciando...</span>
            </div>
          ) : (
            <span>Privacidade total: Seus dados nunca saem deste computador.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SusurroSetup;
