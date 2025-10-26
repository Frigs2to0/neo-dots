"use client"

import Head from "next/head"

export default function Home() {
  return (
    <>
      <Head>
        <title>Dominokas</title>
        <meta name="description" content="Torneios semanais de Deadlock todo domingo às 20h" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg" href="/favicon.svg" />
        <meta name="theme-color" content="#1B1B1B" />
      </Head>

      <div className="container">
        {/* Hero Section */}
        <header className="hero">
          <div className="hero-content">
            <div className="title">
              <img
                src="/images/title.svg"
                alt="Dominokas"
                className="logo"
              />
              <span className="title-sub">Eventos de Deadlock</span>
            </div>
            <p className="tagline">Todo Domingo • 20:00</p>
            <div className="cta-buttons">
              <a
                href="https://discord.gg/2tMUabCsUK"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="btn btn-primary">Quero Jogar</button>
              </a>
              <a
                href="https://www.twitch.tv/nokeimee"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="btn btn-secondary">Assistir</button>
              </a>
            </div>
          </div>
        </header>

        {/* O que é Section */}
        <section className="section">
          <div className="section-content">
            <h2 className="section-title">O que é Dominokas?</h2>
            <p className="section-text">
              Dominokas é um evento que acontece todo domingo às 20h. São partidas personalizadas com o Chat! As
              partidas são feitas com um sistema de Draft (pick's e ban's) e é <strong>transmitida</strong> e narrada
              pelo Nokeimee, em live.
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
                <h3>Inscrição Simples</h3>
                <p>Entre no nosso Discord e registre-se através do bot automatizado</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚔️</div>
                <h3>Experiência Competitiva</h3>
                <p>Partidas organizadas com Balanceamento de Times por MMR, e Draft de Heróis(Ban's e Pick's)</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏅</div>
                <h3>Premiação</h3>
                <p>Os 3 melhores jogadores de cada edição são analisados e honrados com um Cargo no Discord.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📅</div>
                <h3>Toda Domingo</h3>
                <p>Dominokas acontece semanalmente às 20h, todos os Domingos!</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="section cta-section">
          <div className="section-content">
            <h2 className="section-title">Pronto para Competir?</h2>
            <p className="section-text">Junte-se à comunidade Dominokas e mostre suas habilidades no Deadlock!</p>
            <a
              href="https://discord.gg/2tMUabCsUK"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="btn btn-primary">Entrar no Discord</button>
            </a>
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
          background: #1B1B1B;
        }

        .container {
          position: relative;
          background: #1B1B1B; /* fundo liso pro resto do site */
          color: #E4E4E4;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          overflow-x: hidden;
        }

        /* Updated pattern overlay to use red tones */
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
              rgba(146, 119, 21, 0.02) 2px,
              rgba(146, 119, 21, 0.02) 4px
            );
          pointer-events: none;
          z-index: 1;
        }

        /* Hero Section */
        /* Added background image from first image provided */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 2rem;
          background-image: url('/images/background.png'); /* textura */
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }


        /* Added overlay to darken background image for better text contrast */
        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(27, 27, 27, 0.75);
          z-index: 0;
        }

        .hero-content {
          text-align: center;
          z-index: 2;
          position: relative;
        }

        .title {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .logo-box {
          width: clamp(300px, 60vw, 700px);
          height: clamp(90px, 15vw, 180px);  /* altura menor = menos espaço vertical */
          overflow: hidden;
          margin: 0 auto 1rem;
          position: relative;
        }

        /* Added logo styling for SVG */
        .logo {
          width: 100%;
          height: auto;
          display: block;
          transform: translateY(-10%); /* “invade” o espaço em branco de cima */
          filter: drop-shadow(0 0 25px rgba(146, 119, 21, 0.8));
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        .logo-box:hover .logo {
          transform: translateY(-10%) scale(1.02);
          filter: drop-shadow(0 0 50px rgba(255, 176, 16, 0.9));
        }

        .logo:hover {
          filter: drop-shadow(0 0 50px rgba(255, 176, 16, 0.9));
        }

        @keyframes logo-glow {
          0%, 100% {
            filter: drop-shadow(0 0 30px rgba(146, 119, 21, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 50px rgba(146, 119, 21, 1)) drop-shadow(0 0 80px rgba(255, 176, 16, 0.6));
          }
        }


        .title-sub {
          font-size: clamp(1.2rem, 3vw, 2rem);
          font-weight: 600;
          color: #E4E4E4;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          opacity: 0.9;
        }

        /* Updated tagline color to yellow for highlights */
        .tagline {
          font-size: clamp(1.2rem, 2.5vw, 1.8rem);
          color: #FFB010;
          font-weight: 600;
          margin-bottom: 3rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes logo-glow {
          0%, 100% {
            filter: drop-shadow(0 0 30px rgba(146, 119, 21, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 50px rgba(146, 119, 21, 1)) drop-shadow(0 0 80px rgba(255, 176, 16, 0.6));
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

        /* Updated primary button to use red gradient with yellow text */
        .btn-primary {
          background: linear-gradient(135deg, #927715, #6d5710);
          color: #FFB010;
          box-shadow: 0 0 20px rgba(146, 119, 21, 0.4);
          font-weight: 800;
        }

        .btn-primary:hover {
          box-shadow: 0 0 30px rgba(146, 119, 21, 0.6), 0 0 40px rgba(255, 176, 16, 0.3);
          transform: translateY(-2px);
        }

        /* Updated secondary button to use yellow border */
        .btn-secondary {
          background: transparent;
          color: #FFB010;
          border: 2px solid #FFB010;
        }

        .btn-secondary:hover {
          background: rgba(255, 176, 16, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(255, 176, 16, 0.3);
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
          color: #E4E4E4;
          position: relative;
          display: inline-block;
          width: 100%;
        }

        /* Updated underline to use red color */
        .section-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #927715, transparent);
        }

        .section-text {
          font-size: 1.2rem;
          line-height: 1.8;
          text-align: center;
          color: #cccccc;
          max-width: 800px;
          margin: 0 auto 2rem;
        }

        /* Updated strong text to use yellow for highlights */
        .section-text strong {
          color: #FFB010;
          font-weight: 700;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        /* Updated feature card borders to use red */
        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(146, 119, 21, 0.3);
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .feature-card:hover {
          transform: translateY(-10px);
          border-color: rgba(146, 119, 21, 0.6);
          box-shadow: 0 10px 40px rgba(146, 119, 21, 0.3);
          background: rgba(255, 255, 255, 0.05);
        }

        /* Updated icon glow to use red */
        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 10px rgba(146, 119, 21, 0.5));
        }

        /* Updated h3 color to yellow for highlights */
        .feature-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #FFB010;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .feature-card p {
          font-size: 1rem;
          line-height: 1.6;
          color: #cccccc;
        }

        /* Updated CTA section background to use red gradient */
        .cta-section {
          background: linear-gradient(135deg, rgba(146, 119, 21, 0.15), rgba(109, 87, 16, 0.1));
          border-top: 1px solid rgba(146, 119, 21, 0.3);
          border-bottom: 1px solid rgba(146, 119, 21, 0.3);
        }

        .cta-section .section-content {
          text-align: center;
        }

        /* Updated scrollbar to use red theme */
        ::-webkit-scrollbar {
          width: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #1B1B1B;
        }

        ::-webkit-scrollbar-thumb {
          background-color: #927715;
          border-radius: 6px;
          border: 3px solid #1B1B1B;
        }

        ::-webkit-scrollbar-thumb:hover {
          background-color: #FFB010;
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
          .logo {
            width: clamp(250px, 80vw, 500px);
          }

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
