"use client"

import Head from "next/head"

export default function Home() {
  return (
    <>
      <Head>
        <title>Dominokas - Torneios de Deadlock</title>
        <meta name="description" content="Torneios semanais de Deadlock todo domingo às 20h" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        {/* Hero Section */}
        <header className="hero">
          <div className="neon-splatter top-left"></div>
          <div className="neon-splatter top-right"></div>
          <div className="neon-splatter bottom-left"></div>
          <div className="neon-splatter bottom-right"></div>

          <div className="hero-content">
            <h1 className="title">
              <span className="title-main">DOMINOKAS</span>
              <span className="title-sub">Torneios de Deadlock</span>
            </h1>
            <p className="tagline">Todo Domingo • 20:00</p>
            <div className="cta-buttons">
              <button className="btn btn-primary">Participar Agora</button>
              <button className="btn btn-secondary">Saiba Mais</button>
            </div>
          </div>
        </header>

        {/* O que é Section */}
        <section className="section">
          <div className="section-content">
            <h2 className="section-title">O que é Dominokas?</h2>
            <p className="section-text">
              Dominokas é o maior torneio semanal de <strong>Deadlock</strong> da comunidade brasileira. Toda semana,
              jogadores se reúnem para competir em partidas emocionantes, testar suas habilidades e conquistar a glória
              no campo de batalha.
            </p>
          </div>
        </section>

        {/* Como Funciona Section */}
        <section className="section">
          <div className="section-content">
            <h2 className="section-title">Como Funciona</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎮</div>
                <h3>Inscrição Fácil</h3>
                <p>Entre no nosso Discord e registre-se através do bot automatizado</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚔️</div>
                <h3>Formato Competitivo</h3>
                <p>Partidas organizadas com sistema de brackets e eliminatórias</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3>Premiação</h3>
                <p>Os melhores jogadores ganham reconhecimento e prêmios exclusivos</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📅</div>
                <h3>Toda Semana</h3>
                <p>Novos torneios todo domingo às 20h, sem falta</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="section cta-section">
          <div className="section-content">
            <h2 className="section-title">Pronto para Competir?</h2>
            <p className="section-text">Junte-se à comunidade Dominokas e mostre suas habilidades no Deadlock!</p>
            <button className="btn btn-primary btn-large">Entrar no Discord</button>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <p>© 2025 Dominokas • Comunidade Deadlock Brasil</p>
        </footer>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :global(html),
        :global(body) {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }

        :global(body) {
          background: #0a0a0f;
        }

        .container {
          min-height: 100vh;
          background: #0a0a0f;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        .container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.02) 2px,
              rgba(255, 255, 255, 0.02) 4px
            );
          pointer-events: none;
          z-index: 1;
        }

        /* Hero Section */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 1rem;
        }

        .neon-splatter {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: pulse 4s ease-in-out infinite;
          z-index: 0;
        }

        .top-left {
          top: -200px;
          left: -200px;
          background: radial-gradient(circle, #ff0040, #8b0000);
          animation-delay: 0s;
        }

        .top-right {
          top: -150px;
          right: -150px;
          background: radial-gradient(circle, #ff0040, #8b0000);
          animation-delay: 1s;
        }

        .bottom-left {
          bottom: -150px;
          left: -100px;
          background: radial-gradient(circle, #ff0040, #8b0000);
          animation-delay: 2s;
        }

        .bottom-right {
          bottom: -200px;
          right: -200px;
          background: radial-gradient(circle, #ff0040, #8b0000);
          animation-delay: 3s;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.6;
          }
        }

        .hero-content {
          text-align: center;
          z-index: 2;
          position: relative;
        }

        .title {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .title-main {
          font-size: clamp(3rem, 10vw, 7rem);
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #ff0040, #ff4d6d, #ff0040);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 3s ease infinite;
          text-shadow: 0 0 40px rgba(255, 0, 64, 0.5);
          filter: drop-shadow(0 0 20px rgba(255, 0, 64, 0.8));
        }

        .title-sub {
          font-size: clamp(1.2rem, 3vw, 2rem);
          font-weight: 600;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          opacity: 0.9;
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .tagline {
          font-size: clamp(1.2rem, 2.5vw, 1.8rem);
          color: #ff4d6d;
          font-weight: 600;
          margin-bottom: 3rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(255, 0, 64, 0.5);
          }
          50% {
            text-shadow: 0 0 20px rgba(255, 0, 64, 0.8), 0 0 30px rgba(255, 0, 64, 0.6);
          }
        }

        .cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .btn:hover::before {
          width: 300px;
          height: 300px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ff0040, #c9184a);
          color: #ffffff;
          box-shadow: 0 0 20px rgba(255, 0, 64, 0.4);
        }

        .btn-primary:hover {
          box-shadow: 0 0 30px rgba(255, 0, 64, 0.6);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: transparent;
          color: #ff4d6d;
          border: 2px solid #ff4d6d;
        }

        .btn-secondary:hover {
          background: rgba(255, 0, 64, 0.1);
          transform: translateY(-2px);
        }

        .btn-large {
          padding: 1.2rem 3rem;
          font-size: 1.3rem;
        }

        /* Sections */
        .section {
          padding: 5rem 2rem;
          position: relative;
          z-index: 2;
        }

        .section-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          text-align: center;
          margin-bottom: 2rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #ffffff;
          position: relative;
          display: inline-block;
          width: 100%;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #ff0040, transparent);
        }

        .section-text {
          font-size: 1.2rem;
          line-height: 1.8;
          text-align: center;
          color: #cccccc;
          max-width: 800px;
          margin: 0 auto 2rem;
        }

        .section-text strong {
          color: #ff4d6d;
          font-weight: 700;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 0, 64, 0.2);
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .feature-card:hover {
          transform: translateY(-10px);
          border-color: rgba(255, 0, 64, 0.5);
          box-shadow: 0 10px 40px rgba(255, 0, 64, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 10px rgba(255, 0, 64, 0.5));
        }

        .feature-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #ff4d6d;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .feature-card p {
          font-size: 1rem;
          line-height: 1.6;
          color: #cccccc;
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, rgba(255, 0, 64, 0.1), rgba(139, 0, 0, 0.1));
          border-top: 1px solid rgba(255, 0, 64, 0.2);
          border-bottom: 1px solid rgba(255, 0, 64, 0.2);
        }

        .cta-section .section-content {
          text-align: center; /* centraliza todos os elementos filhos inline */
        }

        /* Scrollbar inteira */
        ::-webkit-scrollbar {
          width: 12px; /* largura da barra de rolagem */
        }

        /* Fundo da barra (track) */
        ::-webkit-scrollbar-track {
          background: #0a0a0f; /* cor escura, igual ao fundo */
        }

        /* Parte que você arrasta (thumb) */
        ::-webkit-scrollbar-thumb {
          background-color: #ff0040; /* cor da barra de rolagem */
          border-radius: 6px; /* deixa arredondada */
          border: 3px solid #0a0a0f; /* cria uma borda para ficar separada do track */
        }

        /* Ao passar o mouse */
        ::-webkit-scrollbar-thumb:hover {
          background-color: #ff4d6d; /* cor ao passar o mouse */
        }

        /* Footer */
        .footer {
          padding: 2rem;
          text-align: center;
          color: #666666;
          font-size: 0.9rem;
          position: relative;
          z-index: 2;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 300px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .section {
            padding: 3rem 1.5rem;
          }
        }
      `}</style>
    </>
  )
}
