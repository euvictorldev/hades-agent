import React, { useEffect, useState } from 'react';

// ==========================================
// CONFIGURAÇÃO DO ÍCONE (Ajuste aqui)
// ==========================================
// Você pode alterar a largura e a altura do ícone livremente aqui.
// O texto ASCII Figlet está isolado e não será afetado pelo tamanho do ícone.
const ICON_WIDTH = '145px';
const ICON_HEIGHT = '145px';

const Splash: React.FC = () => {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'leaving'>('entering');

  useEffect(() => {
    // Fase de entrada: starts 50ms after mount to trigger transition smoothly
    const enterTimer = setTimeout(() => setPhase('visible'), 50);
    // Fase de saída começa após 2.4s
    const leaveTimer = setTimeout(() => setPhase('leaving'), 2400);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
    };
  }, []);

  let opacity = 0;
  let transform = 'scale(0.92) translateY(12px)';

  if (phase === 'visible') {
    opacity = 1;
    transform = 'scale(1) translateY(0px)';
  } else if (phase === 'leaving') {
    transform = 'scale(1.03) translateY(-12px)';
  }

  // Premium, continuous transition that is always active
  const opacityTransition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  const transformTransition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

  // HADES-AGENT em fonte Figlet ANSI Shadow
  const asciiArt = `██╗  ██╗ █████╗ ██████╗ ███████╗███████╗       █████╗  ██████╗ ███████╗███╗   ██╗████████╗
██║  ██║██╔══██╗██╔══██╗██╔════╝██╔════╝      ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
███████║███████║██║  ██║█████╗  ███████╗█████╗███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   
██╔══██║██╔══██║██║  ██║██╔══╝  ╚════██║╚════╝██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   
██║  ██║██║  ██║██████╔╝███████╗███████║      ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   
╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝      ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝`;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000000', // Fundo preto premium
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        WebkitAppRegion: 'drag',
        userSelect: 'none',
        opacity,
        transition: opacityTransition,
      } as any}
    >
      <div
        style={{
          transform,
          transition: transformTransition,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '8px',
        }}
      >
        {/* CONTAINER DO ÍCONE: Isolado para redimensionamento independente */}
        <div 
          style={{ 
            width: ICON_WIDTH, 
            height: ICON_HEIGHT,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src="./icon/icon.png"
            alt="Hades Icon"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '4px 16px 4px 16px',
              border: '1px solid #ff2a2a',
              filter: 'drop-shadow(0 0 15px rgba(220, 38, 38, 0.35))',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* CONTAINER DO TEXTO FIGLET: Totalmente isolado do tamanho do ícone */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <pre
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '12px',
              lineHeight: '1.2',
              fontWeight: 'bold',
              margin: 0,
              padding: 0,
              background: 'linear-gradient(180deg, #ff3333 0%, #a30000 70%, #540000 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))',
              whiteSpace: 'pre',
              pointerEvents: 'none',
            }}
          >
            {asciiArt}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Splash;
