"use client";

import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Neo Dots - Treine sua Mecânica</title>
        <link
          rel="icon"
          href={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 fontSize=%2290%22>🎮</text></svg>`}
        />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=JetBrains+Mono:wght@400;600&display=swap");

        body {
          font-family: "Inter", sans-serif;
        }

        .font-mono {
          font-family: "JetBrains Mono", monospace;
        }

        @keyframes glow-pulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-glow {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf620_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf620_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Glowing orbs for depth */}
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-600/30 blur-[120px] animate-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-violet-600/30 blur-[120px] animate-glow"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center gap-12 px-4">
          {/* Logo/Title */}
          <div className="flex flex-col items-center gap-4 animate-float">
            <div className="flex items-center gap-3">
              {/* Geometric logo icon */}
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-lg bg-purple-500/40 blur-md" />
                <div className="relative flex h-full w-full items-center justify-center rounded-lg border-2 border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/50">
                  <div className="h-4 w-4 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                </div>
              </div>
              <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                NEO DOTS
              </h1>
            </div>
            <p className="text-center font-mono text-sm uppercase tracking-widest text-purple-300 md:text-base">
              Treine sua mecânica • Melhore seu dodge
            </p>
          </div>

          {/* Play button */}
          <div className="flex flex-col items-center gap-6">
            <button
              className="group relative h-16 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-12 text-xl font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/60"
              onMouseEnter={(e) => {
                const arrow = e.currentTarget.querySelector(".arrow");
                if (arrow) arrow.classList.add("translate-x-1");
              }}
              onMouseLeave={(e) => {
                const arrow = e.currentTarget.querySelector(".arrow");
                if (arrow) arrow.classList.remove("translate-x-1");
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Jogar
                <svg
                  className="arrow h-6 w-6 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
              {/* Animated background effect */}
              <div className="absolute inset-0 -z-0 bg-white opacity-0 transition-opacity group-hover:opacity-10" />
            </button>

            {/* Secondary options */}
            <div className="flex gap-4">
              <button className="font-mono text-sm uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors">
                Como Jogar
              </button>
              <button className="font-mono text-sm uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors">
                Recordes
              </button>
            </div>
          </div>

          {/* Stats preview */}
          <div className="mt-8 flex gap-8 rounded-lg border border-purple-500/30 bg-purple-950/30 px-8 py-4 backdrop-blur-sm shadow-lg">
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-2xl font-bold text-purple-400">
                0
              </span>
              <span className="text-xs uppercase tracking-wider text-purple-300/70">
                Melhor Score
              </span>
            </div>
            <div className="h-full w-px bg-purple-500/30" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-2xl font-bold text-violet-400">
                0
              </span>
              <span className="text-xs uppercase tracking-wider text-purple-300/70">
                Partidas
              </span>
            </div>
          </div>
        </div>

        {/* Version indicator */}
        <div className="absolute bottom-4 right-4 font-mono text-xs text-purple-400/50">
          v0.1.0 ALPHA
        </div>
      </main>
    </>
  );
}
