import { useEffect, useState } from 'react'

const Splash: React.FC = () => {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'leaving'>('entering')

  useEffect(() => {
    // Fase de entrada: starts 50ms after mount to trigger transition smoothly
    const enterTimer = setTimeout(() => setPhase('visible'), 50)
    // Fase de saída começa após 2.4s
    const leaveTimer = setTimeout(() => setPhase('leaving'), 2400)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(leaveTimer)
    }
  }, [])

  let opacity = 0
  let transform = 'scale(0.88) translateY(12px)'

  if (phase === 'visible') {
    opacity = 1
    transform = 'scale(1) translateY(0px)'
  } else if (phase === 'leaving') {
    opacity = 0
    transform = 'scale(1.05) translateY(-12px)'
  }

  // Premium, continuous transition that is always active
  const transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        WebkitAppRegion: 'drag',
        userSelect: 'none',
      } as any}
    >
      <div
        style={{
          opacity,
          transform,
          transition,
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}
      >
        <img
          src="/icon/icon.png"
          alt="Hades Icon"
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '4px 16px 4px 16px',
            border: '1px solid #ff2a2a',
            filter: 'drop-shadow(4px 4px 0 #000000)',
            objectFit: 'cover'
          }}
        />
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '48px',
            fontWeight: 400,
            letterSpacing: '3px',
            color: '#ff2020',
            display: 'block',
            lineHeight: 1,
            background: 'linear-gradient(180deg, #ff2a2a 0%, #cc0000 45%, #6b0000 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(6px 6px 0 #000000)',
            whiteSpace: 'nowrap'
          }}
        >
          HADES-AGENT
        </span>
      </div>
    </div>
  )
}

export default Splash
