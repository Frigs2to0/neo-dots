"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { EventSourcePolyfill } from "event-source-polyfill"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""
const NGROK_HEADERS = { "ngrok-skip-browser-warning": "true" }
const HEROES_URL = "https://assets.deadlock-api.com/v2/heroes"

function getHeroImage(hero) {
  if (!hero) return null
  if (hero.images) {
    return hero.images.icon_hero_card || hero.images.card || hero.images.icon || null
  }
  return hero.image || hero.icon || null
}

function getHeroName(hero) {
  return hero?.name ?? hero?.displayName ?? hero?.slug ?? "?"
}

function getLocalHeroImage(heroName, type) {
  if (!heroName) return null
  let name = heroName.toLowerCase()
  // Normalizar nomes com "the" no início (ex: "The Doorman" -> "doorman")
  if (name.startsWith("the ")) {
    name = name.slice(4)
  }
  return `/heroes/Deadlock Heróis Fotos/${name} ${type}.png`
}

// ============================================================================
// SEQUENCE INDICATOR - Visualização da ordem de picks/bans
// ============================================================================
function SequenceIndicator({ sequence, stepIndex, finished }) {
  return (
    <div className="sequence-indicator">
      <div className="sequence-steps">
        {sequence.map((step, i) => {
          const isCompleted = i < stepIndex
          const isCurrent = i === stepIndex && !finished
          const isAmbar = step.team === "ambar"
          const isBan = step.type === "ban"

          return (
            <div
              key={i}
              className={`step-icon ${isBan ? "ban" : "pick"} ${isAmbar ? "ambar" : "safira"} ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
              title={`${step.type === "ban" ? "Ban" : "Pick"} - ${step.team === "ambar" ? "Âmbar" : "Safira"}`}
            >
              {isBan ? "✕" : "◆"}
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .sequence-indicator {
          display: flex;
          justify-content: center;
          padding: 0.5rem 0;
        }
        .sequence-steps {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
          max-width: 100%;
        }
        .step-icon {
          font-size: 12px;
          line-height: 1;
          transition: all 0.2s ease;
        }
        .step-icon.ambar {
          color: #ffb010;
        }
        .step-icon.safira {
          color: #7b9aff;
        }
        .step-icon.completed {
          opacity: 0.3;
        }
        .step-icon.current {
          font-size: 18px;
          animation: stepPulse 0.8s infinite alternate;
        }
        .step-icon.current.ambar {
          text-shadow: 0 0 8px rgba(255, 176, 16, 0.8);
        }
        .step-icon.current.safira {
          text-shadow: 0 0 8px rgba(123, 154, 255, 0.8);
        }
        @keyframes stepPulse {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// STREAMER VIEW - Layout otimizado para stream (sem grade de heróis)
// ============================================================================
function StreamerView({ state, heroMap }) {
  const ambarName = state.ambarName || "Âmbar"
  const safiraName = state.safiraName || "Safira"

  const phaseLabel = state.finished
    ? "Draft Finalizado"
    : `${state.currentAction === "ban" ? "Ban" : "Pick"}`

  const activeTeamLabel = state.currentTeam === "ambar" ? ambarName : safiraName
  const activeTeamColor = state.currentTeam === "ambar" ? "#ffb010" : "#7b9aff"

  function getSlotImageForBan(entry) {
    if (!entry || !heroMap) return null
    const localImage = getLocalHeroImage(entry.name, "ban")
    if (localImage) return localImage
    const hero = heroMap[entry.id]
    return hero ? getHeroImage(hero) : null
  }

  function getSlotImageForPick(entry) {
    if (!entry || !heroMap) return null
    const localImage = getLocalHeroImage(entry.name, "pick")
    if (localImage) return localImage
    const hero = heroMap[entry.id]
    return hero ? getHeroImage(hero) : null
  }

  return (
    <>
      <Head>
        <title>Draft | Streamer View | Dominokas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#111114" />
      </Head>

      <div className="streamer-page">
        {!state.started && (
          <div className="start-overlay">
            <div className="start-box">
              <h2>Aguardando Times</h2>
              <p>O draft iniciará automaticamente quando ambos os times confirmarem</p>
              <div className="team-status">
                <p className={state.ambarReady ? "ready" : "waiting"}>
                  {ambarName}: {state.ambarReady ? "Pronto!" : "Aguardando..."}
                </p>
                <p className={state.safiraReady ? "ready" : "waiting"}>
                  {safiraName}: {state.safiraReady ? "Pronto!" : "Aguardando..."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Layout: Time Âmbar | Câmera + Bans + Timer | Time Safira */}
        <main className="streamer-layout">
          <StreamerTeamPanel
            label={ambarName}
            team="ambar"
            picks={state.ambar.picks}
            maxPicks={state.config.picks}
            isActive={state.currentTeam === "ambar" && !state.finished}
            currentAction={state.currentAction}
            heroMap={heroMap}
          />

          <div className="center-column">
            <div className="camera-space">
              <div className="camera-placeholder">
                <span className="camera-icon">🎥</span>
                <span className="camera-label">Câmera do Streamer</span>
              </div>
            </div>

            <div className="bans-section">
              <div className="bans-team bans-ambar">
                <div className="bans-team-label">Bans {ambarName}</div>
                <div className="bans-grid">
                  {Array.from({ length: state.config.bans }).map((_, i) => {
                    const isActiveSlot = state.currentTeam === "ambar" && !state.finished && state.currentAction === "ban" && i === state.ambar.bans.length
                    const entry = state.ambar.bans[i]
                    const isNoBan = entry?.noBan || entry?.id === null
                    const img = getSlotImageForBan(entry)
                    return (
                      <div key={i} className={`ban-card ${entry ? "filled" : ""} ${isActiveSlot ? "active-slot" : ""} ${isNoBan ? "no-ban-card" : ""}`}>
                        {isNoBan ? (
                          <span className="no-ban-x-streamer">✕</span>
                        ) : (
                          <>
                            {img && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={img} alt={entry.name} className="card-img" />
                            )}
                          </>
                        )}
                        <span className="card-name">{entry ? entry.name : ""}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="bans-team bans-safira">
                <div className="bans-team-label">Bans {safiraName}</div>
                <div className="bans-grid">
                  {Array.from({ length: state.config.bans }).map((_, i) => {
                    const isActiveSlot = state.currentTeam === "safira" && !state.finished && state.currentAction === "ban" && i === state.safira.bans.length
                    const entry = state.safira.bans[i]
                    const isNoBan = entry?.noBan || entry?.id === null
                    const img = getSlotImageForBan(entry)
                    return (
                      <div key={i} className={`ban-card ${entry ? "filled" : ""} ${isActiveSlot ? "active-slot" : ""} ${isNoBan ? "no-ban-card" : ""}`}>
                        {isNoBan ? (
                          <span className="no-ban-x-streamer">✕</span>
                        ) : (
                          <>
                            {img && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={img} alt={entry.name} className="card-img" />
                            )}
                          </>
                        )}
                        <span className="card-name">{entry ? entry.name : ""}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {state.sequence && (
              <SequenceIndicator
                sequence={state.sequence}
                stepIndex={state.stepIndex}
                finished={state.finished}
              />
            )}

            <div className="timer-section">
              <div className="reserve-display reserve-ambar">
                <span className={`reserve-time ${state.currentTeam === "ambar" && state.timer.usingReserve ? "active" : ""}`}>
                  {state.ambar.reserveTime}s
                </span>
                <span className="reserve-label">Reserva</span>
              </div>
              <div className="timer-block">
                <span className={`big-timer ${state.timer.remaining <= 5 && !state.timer.usingReserve ? "urgent" : ""} ${state.timer.usingReserve ? "using-reserve" : ""}`}>
                  {state.timer.usingReserve ? state[state.currentTeam]?.reserveTime ?? 0 : state.timer.remaining}
                </span>
                <span className="timer-label">{state.timer.usingReserve ? "reserva" : "segundos"}</span>
              </div>
              <div className="reserve-display reserve-safira">
                <span className={`reserve-time ${state.currentTeam === "safira" && state.timer.usingReserve ? "active" : ""}`}>
                  {state.safira.reserveTime}s
                </span>
                <span className="reserve-label">Reserva</span>
              </div>
              <div className="phase-block">
                <span className="phase-text" style={{ color: activeTeamColor }}>
                  {state.finished ? "Finalizado" : `${phaseLabel} — ${activeTeamLabel}`}
                </span>
              </div>
            </div>
          </div>

          <StreamerTeamPanel
            label={safiraName}
            team="safira"
            picks={state.safira.picks}
            maxPicks={state.config.picks}
            isActive={state.currentTeam === "safira" && !state.finished}
            currentAction={state.currentAction}
            heroMap={heroMap}
          />
        </main>
      </div>

      <style jsx>{`
        .streamer-page {
          height: 100vh;
          overflow: hidden;
          background: #0a0a0c;
          color: #e4e4e4;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-image:
            linear-gradient(90deg, rgba(146,119,21,0.08) 0%, transparent 30%),
            linear-gradient(270deg, rgba(47,77,181,0.08) 0%, transparent 30%);
          display: flex;
          flex-direction: column;
        }

        .start-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        .start-box {
          background: rgba(30, 30, 35, 0.95);
          border: 2px solid rgba(255, 176, 16, 0.4);
          border-radius: 16px;
          padding: 3rem 4rem;
          text-align: center;
          box-shadow: 0 0 60px rgba(255, 176, 16, 0.15);
        }
        .start-box h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #ffb010;
          margin: 0 0 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .start-box p {
          color: #999;
          font-size: 1rem;
          margin: 0 0 2rem;
        }
        .team-status {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        .team-status p {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.3s;
        }
        .team-status p.waiting {
          color: #666;
          background: rgba(255, 255, 255, 0.05);
        }
        .team-status p.ready {
          color: #7dff7d;
          background: rgba(125, 255, 125, 0.1);
          border: 1px solid rgba(125, 255, 125, 0.3);
        }

        .streamer-layout {
          flex: 1;
          display: grid;
          grid-template-columns: minmax(200px, 1fr) minmax(300px, 1.4fr) minmax(200px, 1fr);
          gap: 1rem;
          padding: 1rem 1.5rem;
          align-items: stretch;
          min-height: 0;
          overflow: hidden;
          max-height: 100%;
        }

        .center-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-height: 0;
          overflow: hidden;
        }

        .camera-space {
          flex: 1;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 12px;
        }
        .camera-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: #444;
        }
        .camera-icon {
          font-size: 3rem;
          opacity: 0.6;
        }
        .camera-label {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        .bans-section {
          display: flex;
          gap: 1rem;
          flex-shrink: 0;
          min-width: 0;
        }
        .bans-team {
          flex: 1;
          min-width: 0;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 8px;
          padding: 0.5rem;
          overflow: hidden;
        }
        .bans-ambar {
          border: 1px solid rgba(146, 119, 21, 0.3);
        }
        .bans-safira {
          border: 1px solid rgba(47, 77, 181, 0.3);
        }
        .bans-team-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
          margin-bottom: 0.4rem;
          text-align: center;
        }
        .bans-ambar .bans-team-label {
          color: #ffb010;
        }
        .bans-safira .bans-team-label {
          color: #7b9aff;
        }
        .bans-section .bans-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 4px;
        }
        .bans-section .bans-grid .ban-card {
          flex: 0 0 calc(25% - 3px);
          max-width: calc(25% - 3px);
        }
        .bans-section .ban-card {
          aspect-ratio: 3/4;
          background: rgba(0,0,0,0.4);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          overflow: hidden;
          position: relative;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .bans-section .ban-card.filled {
          border-color: rgba(255,68,68,0.4);
        }
        .bans-section .ban-card.active-slot {
          border-color: #ff5555;
          box-shadow: 0 0 12px rgba(255,68,68,0.4);
          background: linear-gradient(90deg, rgba(255,68,68,0.03), rgba(255,68,68,0.12), rgba(255,68,68,0.03));
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
        .bans-section .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          inset: 0;
        }
        .bans-section .card-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.9));
          color: #e4e4e4;
          font-size: 0.85rem;
          font-weight: 700;
          text-align: center;
          padding: 8px 3px 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .bans-section .ban-card.filled .card-name {
          color: #ff6666;
          text-decoration: line-through;
        }
        .bans-section .ban-card.no-ban-card .card-name {
          text-decoration: none;
        }
        .bans-section .ban-card.no-ban-card {
          background: linear-gradient(135deg, rgba(255,68,68,0.15), rgba(0,0,0,0.5));
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .no-ban-x-streamer {
          font-size: 1.8rem;
          color: #ff5555;
          font-weight: bold;
        }
        .timer-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          padding: 0.75rem 1rem;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          flex-shrink: 0;
        }

        .timer-block {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .big-timer {
          font-size: 2.5rem;
          font-weight: 900;
          font-variant-numeric: tabular-nums;
          color: #e4e4e4;
          line-height: 1;
          transition: color 0.3s;
        }
        .big-timer.urgent {
          color: #ff4444;
          animation: pulse 0.5s infinite alternate;
        }
        .big-timer.using-reserve {
          color: #ff9944;
        }
        .timer-label {
          font-size: 0.75rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .reserve-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.3);
          min-width: 50px;
        }
        .reserve-ambar {
          border: 1px solid rgba(255, 176, 16, 0.3);
        }
        .reserve-safira {
          border: 1px solid rgba(123, 154, 255, 0.3);
        }
        .reserve-time {
          font-size: 1rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          transition: all 0.3s;
        }
        .reserve-ambar .reserve-time {
          color: rgba(255, 176, 16, 0.5);
        }
        .reserve-safira .reserve-time {
          color: rgba(123, 154, 255, 0.5);
        }
        .reserve-time.active {
          animation: reservePulse 0.6s infinite alternate;
        }
        .reserve-ambar .reserve-time.active {
          color: #ffb010;
          text-shadow: 0 0 10px rgba(255, 176, 16, 0.6);
        }
        .reserve-safira .reserve-time.active {
          color: #7b9aff;
          text-shadow: 0 0 10px rgba(123, 154, 255, 0.6);
        }
        .reserve-label {
          font-size: 0.55rem;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        @keyframes reservePulse {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0.7; transform: scale(1.05); }
        }

        .phase-block {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .phase-text {
          font-size: 1.3rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .step-text {
          font-size: 0.75rem;
          color: #666;
        }

        @keyframes pulse {
          from { opacity: 1; }
          to { opacity: 0.4; }
        }

        @media (max-width: 1200px) {
          .streamer-layout {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto 1fr;
          }
          .center-column {
            grid-column: 1 / -1;
            grid-row: 1;
          }
        }

        @media (max-width: 700px) {
          .streamer-page {
            height: auto;
            min-height: 100vh;
            overflow: auto;
          }
          .streamer-layout {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          .center-column {
            grid-column: auto;
          }
          .timer-section {
            flex-direction: column;
            gap: 0.5rem;
          }
          .phase-block {
            align-items: center;
          }
        }
      `}</style>

      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </>
  )
}

// ============================================================================
// STREAMER TEAM PANEL - Cards grandes para visualização em stream
// ============================================================================
function StreamerTeamPanel({ label, team, picks, maxPicks, isActive, currentAction, heroMap }) {
  const isAmbar = team === "ambar"
  const teamColor = isAmbar ? "#ffb010" : "#7b9aff"
  const teamColorRgb = isAmbar ? "146,119,21" : "47,77,181"

  function getSlotImageForPick(entry) {
    if (!entry || !heroMap) return null
    const localImage = getLocalHeroImage(entry.name, "pick")
    if (localImage) return localImage
    const hero = heroMap[entry.id]
    return hero ? getHeroImage(hero) : null
  }

  return (
    <div className={`streamer-panel ${isActive ? "active" : ""}`}>
      <h2 className={`team-title ${isActive ? "team-active" : ""}`}>{label}</h2>

      <div className="section">
        <div className="section-header"></div>
        <div className="picks-grid">
          {Array.from({ length: maxPicks }).map((_, i) => {
            const isActiveSlot = isActive && currentAction === "pick" && i === picks.length
            const entry = picks[i]
            const img = getSlotImageForPick(entry)
            return (
              <div key={i} className={`pick-card ${entry ? "filled" : ""} ${isActiveSlot ? "active-slot" : ""}`}>
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={entry.name} className="card-img" />
                )}
                <span className="card-name">{entry ? entry.name : ""}</span>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .streamer-panel {
          background: linear-gradient(${isAmbar ? "135deg" : "225deg"}, rgba(${teamColorRgb},0.1) 0%, rgba(0,0,0,0.4) 100%);
          border: 2px solid rgba(${teamColorRgb},0.3);
          border-radius: 12px;
          padding: 1rem;
          transition: border-color 0.3s, background 0.3s;
          display: flex;
          flex-direction: column;
          min-height: 0;
          max-height: 100%;
          overflow: hidden;
        }
        .streamer-panel.active {
          border-color: ${teamColor};
          background: linear-gradient(${isAmbar ? "135deg" : "225deg"}, rgba(${teamColorRgb},0.15) 0%, rgba(0,0,0,0.4) 100%);
          box-shadow: 0 0 30px rgba(${teamColorRgb},0.2);
        }

        .team-title {
          color: ${teamColor};
          font-size: 1.4rem;
          font-weight: 900;
          text-transform: uppercase;
          text-align: center;
          margin: 0 0 0.75rem;
          letter-spacing: 0.1em;
          flex-shrink: 0;
        }
        .team-title.team-active {
          animation: teamPulse 1.2s infinite alternate;
        }
        @keyframes teamPulse {
          from { opacity: 1; }
          to { opacity: 0.65; }
        }

        .section {
          margin-bottom: 0.75rem;
          flex: 1;
          min-height: 0;
          max-height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .section:last-child {
          margin-bottom: 0;
        }
        .section-header {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #666;
          font-weight: 700;
          margin-bottom: 0.5rem;
          flex-shrink: 0;
        }

        .picks-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-auto-rows: 1fr;
          gap: 8px;
          flex: 1;
          min-height: 0;
          max-height: 100%;
          padding: 0 0.25rem;
          overflow: hidden;
        }
        .pick-card {
          background: rgba(0,0,0,0.5);
          border: 2px solid rgba(${teamColorRgb},0.25);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          min-height: 0;
          
        }
        .pick-card.filled {
          border-color: rgba(${teamColorRgb},0.5);
        }
        .pick-card.active-slot {
          border-color: ${teamColor};
          box-shadow: 0 0 10px rgba(${teamColorRgb},0.4), inset 0 0 20px rgba(${teamColorRgb},0.05);
          background: linear-gradient(90deg, rgba(${teamColorRgb},0.05), rgba(${teamColorRgb},0.15), rgba(${teamColorRgb},0.05));
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          inset: 0;
        }

        .card-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.9));
          color: #e4e4e4;
          font-size: 1rem;
          font-weight: 700;
          text-align: center;
          padding: 12px 4px 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

      `}</style>
    </div>
  )
}

// ============================================================================
// BAN CONFIRM MODAL - Modal de confirmação para bans
// ============================================================================
function BanConfirmModal({ hero, heroMap, onConfirm, onCancel }) {
  const isNoBan = hero?.id === "no-ban"
  const heroData = heroMap[hero?.id]
  const heroImage = heroData ? getHeroImage(heroData) : null
  const heroName = hero?.name || "?"

  return (
    <div className="ban-modal-overlay" onClick={onCancel}>
      <div className="ban-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="ban-modal-title">{isNoBan ? "Confirmar Sem Ban" : "Confirmar Ban"}</h3>
        <div className={`ban-modal-hero ${isNoBan ? "no-ban-style" : ""}`}>
          {isNoBan ? (
            <span className="no-ban-large-x">✕</span>
          ) : (
            <>
              {heroImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImage} alt={heroName} className="ban-modal-img" />
              )}
              <div className="ban-modal-x">
                <span className="ban-x-line" />
                <span className="ban-x-line rotated" />
              </div>
            </>
          )}
        </div>
        <div className="ban-modal-name">{heroName}</div>
        <div className="ban-modal-buttons">
          <button className="ban-modal-btn cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="ban-modal-btn confirm" onClick={onConfirm}>
            {isNoBan ? "Confirmar" : "Confirmar Ban"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .ban-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .ban-modal {
          background: linear-gradient(135deg, #1a1a1e, #0f0f12);
          border: 2px solid rgba(255, 68, 68, 0.5);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 0 60px rgba(255, 68, 68, 0.2);
          animation: scaleIn 0.2s ease;
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .ban-modal-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #ff5555;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 1.5rem;
        }
        .ban-modal-hero {
          position: relative;
          width: 120px;
          height: 160px;
          margin: 0 auto 1rem;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid rgba(255, 68, 68, 0.4);
        }
        .ban-modal-hero.no-ban-style {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(255,68,68,0.15), rgba(0,0,0,0.6));
        }
        .no-ban-large-x {
          font-size: 4rem;
          color: #ff5555;
          font-weight: bold;
        }
        .ban-modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(0.5) brightness(0.6);
        }
        .ban-modal-x {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ban-x-line {
          position: absolute;
          width: 150%;
          height: 4px;
          background: #ff4444;
          border-radius: 2px;
          transform: rotate(45deg);
        }
        .ban-x-line.rotated {
          transform: rotate(-45deg);
        }
        .ban-modal-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #e4e4e4;
          margin-bottom: 1.5rem;
        }
        .ban-modal-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .ban-modal-btn {
          padding: 0.7rem 1.5rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .ban-modal-btn.cancel {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #999;
        }
        .ban-modal-btn.cancel:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ccc;
        }
        .ban-modal-btn.confirm {
          background: linear-gradient(135deg, #8b2222, #5c1515);
          border: none;
          color: #ff6666;
        }
        .ban-modal-btn.confirm:hover {
          box-shadow: 0 0 20px rgba(255, 68, 68, 0.4);
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// PICK CONFIRM MODAL - Modal de confirmação para picks
// ============================================================================
function PickConfirmModal({ hero, heroMap, teamColor, onConfirm, onCancel }) {
  const heroData = heroMap[hero?.id]
  const heroImage = heroData ? getHeroImage(heroData) : null
  const heroName = hero?.name || "?"

  // Determinar cores baseado no time
  const isAmbar = teamColor === "#ffb010"
  const borderColor = teamColor
  const bgGradient = isAmbar
    ? "linear-gradient(135deg, #2a2210, #0f0f12)"
    : "linear-gradient(135deg, #101828, #0f0f12)"
  const shadowColor = isAmbar
    ? "rgba(255, 176, 16, 0.2)"
    : "rgba(123, 154, 255, 0.2)"
  const btnBg = isAmbar
    ? "linear-gradient(135deg, #927715, #6d5710)"
    : "linear-gradient(135deg, #2f4db5, #1e3080)"
  const btnColor = teamColor

  return (
    <div className="pick-modal-overlay" onClick={onCancel}>
      <div className="pick-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="pick-modal-title">Confirmar Pick</h3>
        <div className="pick-modal-hero">
          {heroImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt={heroName} className="pick-modal-img" />
          )}
        </div>
        <div className="pick-modal-name">{heroName}</div>
        <div className="pick-modal-buttons">
          <button className="pick-modal-btn cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="pick-modal-btn confirm" onClick={onConfirm}>
            Confirmar Pick
          </button>
        </div>
      </div>

      <style jsx>{`
        .pick-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .pick-modal {
          background: ${bgGradient};
          border: 2px solid ${borderColor};
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 0 60px ${shadowColor};
          animation: scaleIn 0.2s ease;
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .pick-modal-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: ${teamColor};
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 1.5rem;
        }
        .pick-modal-hero {
          position: relative;
          width: 120px;
          height: 160px;
          margin: 0 auto 1rem;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid ${borderColor};
        }
        .pick-modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pick-modal-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #e4e4e4;
          margin-bottom: 1.5rem;
        }
        .pick-modal-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .pick-modal-btn {
          padding: 0.7rem 1.5rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .pick-modal-btn.cancel {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #999;
        }
        .pick-modal-btn.cancel:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ccc;
        }
        .pick-modal-btn.confirm {
          background: ${btnBg};
          border: none;
          color: ${btnColor};
        }
        .pick-modal-btn.confirm:hover {
          box-shadow: 0 0 20px ${shadowColor};
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// HOOKS AND HELPERS
// ============================================================================

function useHeroes() {
  const [heroes, setHeroes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(HEROES_URL)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setHeroes(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { heroes, loading }
}

function getHeroId(hero) {
  const id = hero?.id ?? hero?.heroId
  if (id !== undefined && id !== null) return String(id)
  return hero?.name || null
}

export default function DraftView() {
  const router = useRouter()
  const { room: roomId, token } = router.query

  const { heroes, loading: heroesLoading } = useHeroes()
  const [state, setState] = useState(null)
  const [role, setRole] = useState(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const [pendingBan, setPendingBan] = useState(null)
  const [pendingPick, setPendingPick] = useState(null)
  const [editingTeamName, setEditingTeamName] = useState("")
  const [savingTeamName, setSavingTeamName] = useState(false)
  const eventSourceRef = useRef(null)

  // Connect to SSE
  useEffect(() => {
    if (!roomId || !token) return

    const es = new EventSourcePolyfill(`${API_URL}/api/v1/draft/${roomId}/stream?token=${token}`, {
      headers: NGROK_HEADERS
    })
    eventSourceRef.current = es

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.role) {
          setRole(data.role)
        }
        setState(data)
        setConnected(true)
      } catch (_) {}
    }
    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        setError("Conexão perdida. Recarregue a página.")
        setConnected(false)
      }
    }

    return () => es.close()
  }, [roomId, token])

  // Lista de heróis a ocultar (modificar aqui para mostrar/esconder)
  const HIDDEN_HEROES = ["Celeste", "Apollo"]

  const sortedHeroes = useMemo(() => {
    return heroes
      .filter((h) => !h.in_development && !h.disabled)
      // Filtrar heróis ocultos - remover esta linha para mostrar todos
      .filter((h) => !HIDDEN_HEROES.includes(getHeroName(h)))
      .sort((a, b) => getHeroName(a).localeCompare(getHeroName(b)))
  }, [heroes])

  const usedIds = useMemo(() => {
    if (!state) return new Set()
    return new Set([
      ...state.ambar.picks,
      ...state.ambar.bans,
      ...state.safira.picks,
      ...state.safira.bans,
    ].map((h) => h.id))
  }, [state])

  const bannedIds = useMemo(() => {
    if (!state) return new Set()
    return new Set([
      ...state.ambar.bans,
      ...state.safira.bans,
    ].map((h) => h.id))
  }, [state])

  async function sendHeroAction(hero) {
    const isNoBan = hero?.id === "no-ban"
    const heroId = isNoBan ? null : getHeroId(hero)
    await fetch(`${API_URL}/api/v1/draft/${roomId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...NGROK_HEADERS },
      body: JSON.stringify({
        token,
        heroId,
        heroName: hero?.name || "Sem Ban",
        noBan: isNoBan
      }),
    })
  }

  function pickHero(hero) {
    if (!state || state.finished) return
    if (role === "streamer") return
    if (state.currentTeam !== role) return

    const heroId = getHeroId(hero)
    if (usedIds.has(heroId)) return

    // Se é um ban, abrir modal de confirmação
    if (state.currentAction === "ban") {
      setPendingBan({ id: heroId, name: getHeroName(hero) })
      return
    }

    // Se é pick, abrir modal de confirmação
    setPendingPick({ id: heroId, name: getHeroName(hero) })
  }

  function confirmBan() {
    if (!pendingBan) return
    sendHeroAction({ id: pendingBan.id, name: pendingBan.name })
    setPendingBan(null)
  }

  function cancelBan() {
    setPendingBan(null)
  }

  function confirmPick() {
    if (!pendingPick) return
    sendHeroAction({ id: pendingPick.id, name: pendingPick.name })
    setPendingPick(null)
  }

  function cancelPick() {
    setPendingPick(null)
  }

  const heroMap = useMemo(() => {
    const map = {}
    for (const h of heroes) {
      const id = getHeroId(h)
      if (id) map[id] = h
    }
    return map
  }, [heroes])

  const ambarName = state?.ambarName || "Âmbar"
  const safiraName = state?.safiraName || "Safira"
  const canAct = state && state.started && !state.finished && role !== "streamer" && state.currentTeam === role

  async function handleReady() {
    await fetch(`${API_URL}/api/v1/draft/${roomId}/ready`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...NGROK_HEADERS },
      body: JSON.stringify({ token }),
    })
  }

  async function handleSaveTeamName() {
    if (!editingTeamName.trim()) return
    setSavingTeamName(true)
    try {
      await fetch(`${API_URL}/api/v1/draft/${roomId}/team-name`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...NGROK_HEADERS },
        body: JSON.stringify({ token, teamName: editingTeamName.trim() }),
      })
      setEditingTeamName("")
    } catch {
    } finally {
      setSavingTeamName(false)
    }
  }
  const isMyTurn = canAct

  // Auto-action when timer reaches 0 AND reserve time reaches 0
  const autoPickedRef = useRef(null)
  useEffect(() => {
    if (!state || !canAct) return
    // Só auto-pick quando ambos os timers chegarem a 0
    const myReserve = state[role]?.reserveTime ?? 0
    if (state.timer.remaining > 0 || myReserve > 0) {
      autoPickedRef.current = null
      return
    }
    // Timer hit 0 and reserve hit 0 and it's our turn — auto action
    const stepKey = `${state.stepIndex}`
    if (autoPickedRef.current === stepKey) return
    autoPickedRef.current = stepKey

    if (state.currentAction === "ban") {
      // Auto "Sem Ban" on timeout
      sendHeroAction({ id: "no-ban", name: "Sem Ban" })
      return
    }

    const available = sortedHeroes.filter((h) => {
      const hid = getHeroId(h)
      return hid && !usedIds.has(hid)
    })
    if (available.length === 0) return
    const random = available[Math.floor(Math.random() * available.length)]
    sendHeroAction({ id: getHeroId(random), name: getHeroName(random) })
  }, [state, canAct, sortedHeroes, usedIds, role])

  if (!roomId || !token) {
    return <div style={{ color: "#e4e4e4", padding: "2rem", background: "#111114", minHeight: "100vh" }}>Carregando...</div>
  }

  if (error) {
    return <div style={{ color: "#ff7777", padding: "2rem", background: "#111114", minHeight: "100vh" }}>{error}</div>
  }

  if (!state) {
    return <div style={{ color: "#e4e4e4", padding: "2rem", background: "#111114", minHeight: "100vh" }}>Conectando à sala...</div>
  }

  // Streamer view: layout otimizado para stream (sem grade de heróis)
  if (role === "streamer") {
    return (
      <StreamerView
        state={state}
        heroMap={heroMap}
      />
    )
  }

  const phaseLabel = state.finished
    ? "Draft Finalizado"
    : `${state.currentAction === "ban" ? "Ban" : "Pick"} — ${state.currentTeam === "ambar" ? ambarName : safiraName}`

  const roleLabel = role === "streamer" ? "Streamer" : role === "ambar" ? `Time ${ambarName}` : `Time ${safiraName}`

  const activeTeamColor = state.currentTeam === "ambar" ? "#ffb010" : "#7b9aff"

  return (
    <>
      <Head>
        <title>Draft | Dominokas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#111114" />
      </Head>

      {pendingBan && (
        <BanConfirmModal
          hero={pendingBan}
          heroMap={heroMap}
          onConfirm={confirmBan}
          onCancel={cancelBan}
        />
      )}

      {pendingPick && (
        <PickConfirmModal
          hero={pendingPick}
          heroMap={heroMap}
          teamColor={role === "ambar" ? "#ffb010" : "#7b9aff"}
          onConfirm={confirmPick}
          onCancel={cancelPick}
        />
      )}

      {!state.started && (role === "ambar" || role === "safira") && (
        <div className="ready-overlay">
          <div className="ready-box">
            <h2>Aguardando Times</h2>
            <div className="ready-status">
              <p className={state.ambarReady ? "ready" : "waiting"}>
                {ambarName}: {state.ambarReady ? "Pronto!" : "Aguardando..."}
              </p>
              <p className={state.safiraReady ? "ready" : "waiting"}>
                {safiraName}: {state.safiraReady ? "Pronto!" : "Aguardando..."}
              </p>
            </div>
            {!state[`${role}Ready`] && (
              <>
                <div className="team-name-edit">
                  <label className="team-name-label">Nome do seu time:</label>
                  <div className="team-name-input-row">
                    <input
                      type="text"
                      className="team-name-input"
                      placeholder={role === "ambar" ? ambarName : safiraName}
                      value={editingTeamName}
                      onChange={(e) => setEditingTeamName(e.target.value)}
                      maxLength={20}
                    />
                    <button
                      className="team-name-save"
                      onClick={handleSaveTeamName}
                      disabled={savingTeamName || !editingTeamName.trim()}
                    >
                      {savingTeamName ? "..." : "Salvar"}
                    </button>
                  </div>
                </div>
                <button onClick={handleReady} className="ready-btn">
                  Pronto
                </button>
              </>
            )}
            {state[`${role}Ready`] && (
              <p className="ready-confirmed">Você confirmou! Aguardando o outro time...</p>
            )}
          </div>
        </div>
      )}

      <div className="page">
        <header className="topbar">
          <div className="topbar-left">
            <div className="brand">Draft Multiplayer</div>
            <div className="role-badge" data-role={role}>{roleLabel}</div>
          </div>
          <div className="timer-center">
            <span className={`timer ${state.timer.remaining <= 5 && !state.timer.usingReserve ? "urgent" : ""} ${state.timer.usingReserve ? "using-reserve" : ""}`}>
              {state.timer.usingReserve ? `${state[state.currentTeam]?.reserveTime ?? 0}s` : `${state.timer.remaining}s`}
            </span>
            {state.timer.usingReserve && <span className="reserve-indicator">RESERVA</span>}
            {isMyTurn && !state.timer.usingReserve && <span className="your-turn">SUA VEZ!</span>}
            {isMyTurn && state.timer.usingReserve && <span className="your-turn reserve-warning">TEMPO RESERVA!</span>}
            {role && role !== "streamer" && (
              <span className="my-reserve">Sua reserva: {state[role]?.reserveTime ?? 0}s</span>
            )}
          </div>
          <div className="phase-right">
            <span className="phase-label" style={{ color: activeTeamColor }}>{phaseLabel}</span>
            <span className="step">{state.stepIndex + 1}/{state.totalSteps}</span>
          </div>
        </header>

        <main className="layout">
          <TeamPanel
            label={ambarName}
            team="ambar"
            picks={state.ambar.picks}
            maxPicks={state.config.picks}
            isActive={state.currentTeam === "ambar" && !state.finished}
            currentAction={state.currentAction}
            heroMap={heroMap}
            reserveTime={state.ambar.reserveTime}
            isUsingReserve={state.timer.usingReserve && state.currentTeam === "ambar"}
          />

          <section className="center">
            {state.sequence && (
              <SequenceIndicator
                sequence={state.sequence}
                stepIndex={state.stepIndex}
                finished={state.finished}
              />
            )}
            <div className="grid">
              {heroesLoading && <div className="muted">Carregando heróis...</div>}
              {/* Card "Sem Ban" - aparece apenas durante a fase de ban */}
              {state.currentAction === "ban" && canAct && (
                <button
                  className="hero no-ban-card clickable"
                  onClick={() => {
                    setPendingBan({ id: "no-ban", name: "Sem Ban" })
                  }}
                  title="Sem Ban"
                  data-team={role}
                >
                  <span className="no-ban-x">✕</span>
                  <span className="hero-name">Sem Ban</span>
                </button>
              )}
              {sortedHeroes.map((h, idx) => {
                const hid = getHeroId(h)
                const disabled = usedIds.has(hid)
                const banned = bannedIds.has(hid)
                const img = getHeroImage(h)
                const clickable = canAct && !disabled
                return (
                  <button
                    key={hid || idx}
                    className={`hero ${disabled ? "disabled" : ""} ${banned ? "banned" : ""} ${clickable ? "clickable" : ""}`}
                    onClick={() => clickable && pickHero(h)}
                    disabled={disabled || !canAct}
                    title={getHeroName(h)}
                    data-team={role}
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={getHeroName(h)} />
                    ) : (
                      <span className="fallback">{getHeroName(h)}</span>
                    )}
                    <span className="hero-name">{getHeroName(h)}</span>
                    {banned && <span className="ban-x" />}
                  </button>
                )
              })}
            </div>
            <div className="bans-footer">
              <BansRow
                label={`Bans ${ambarName}`}
                team="ambar"
                bans={state.ambar.bans}
                maxBans={state.config.bans}
                isActive={state.currentTeam === "ambar" && !state.finished}
                currentAction={state.currentAction}
                heroMap={heroMap}
              />
              <BansRow
                label={`Bans ${safiraName}`}
                team="safira"
                bans={state.safira.bans}
                maxBans={state.config.bans}
                isActive={state.currentTeam === "safira" && !state.finished}
                currentAction={state.currentAction}
                heroMap={heroMap}
              />
            </div>
          </section>

          <TeamPanel
            label={safiraName}
            team="safira"
            picks={state.safira.picks}
            maxPicks={state.config.picks}
            isActive={state.currentTeam === "safira" && !state.finished}
            currentAction={state.currentAction}
            heroMap={heroMap}
            reserveTime={state.safira.reserveTime}
            isUsingReserve={state.timer.usingReserve && state.currentTeam === "safira"}
          />
        </main>
      </div>

      <style jsx>{`
        .page {
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #111114;
          color: #e4e4e4;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-image:
            linear-gradient(90deg, rgba(146,119,21,0.06) 0%, transparent 18%),
            linear-gradient(270deg, rgba(47,77,181,0.06) 0%, transparent 18%);
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.4rem 1rem;
          background: rgba(0,0,0,0.6);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .brand { font-weight: 700; font-size: 0.9rem; color: #999; }
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }
        .timer-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.1rem;
          flex: 0 0 auto;
        }
        .timer {
          font-size: 1.8rem;
          font-weight: 900;
          font-variant-numeric: tabular-nums;
          color: #e4e4e4;
          transition: color 0.3s;
          line-height: 1;
        }
        .timer.urgent { color: #ff4444; animation: pulse 0.5s infinite alternate; }
        .timer.using-reserve { color: #ff9944; }
        .your-turn {
          background: rgba(255,255,255,0.12);
          padding: 0.1rem 0.5rem;
          border-radius: 999px;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          animation: pulse 0.7s infinite alternate;
        }
        .your-turn.reserve-warning {
          background: rgba(255,153,68,0.2);
          color: #ff9944;
        }
        .reserve-indicator {
          background: rgba(255,153,68,0.2);
          color: #ff9944;
          padding: 0.1rem 0.4rem;
          border-radius: 999px;
          font-size: 0.55rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .my-reserve {
          font-size: 0.6rem;
          color: #666;
          margin-top: 0.1rem;
        }
        .phase-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          justify-content: flex-end;
        }
        .phase-label {
          font-weight: 800;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .step { font-size: 0.7rem; opacity: 0.5; color: #e4e4e4; }
        .role-badge {
          padding: 0.15rem 0.5rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .role-badge[data-role="ambar"] { background: rgba(146,119,21,0.2); color: #ffb010; border: 1px solid rgba(146,119,21,0.4); }
        .role-badge[data-role="safira"] { background: rgba(47,77,181,0.2); color: #7b9aff; border: 1px solid rgba(47,77,181,0.4); }
        .role-badge[data-role="streamer"] { background: rgba(255,255,255,0.08); color: #999; border: 1px solid rgba(255,255,255,0.15); }

        @keyframes pulse {
          from { opacity: 1; }
          to { opacity: 0.4; }
        }

        .layout {
          display: grid;
          grid-template-columns: 250px 1fr 250px;
          gap: 0;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .center {
          padding: 0.5rem;
          overflow-y: auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .bans-footer {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
          margin-top: auto;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
          gap: 4px;
          padding: 4px;
        }
        .hero {
          position: relative;
          aspect-ratio: 3/4;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.06);
          background: #0a0a0c;
          cursor: default;
          padding: 0;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hero .fallback { display: grid; place-items: center; height: 100%; padding: 2px; font-size: 8px; color: #666; text-align: center; }
        .hero-name {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.85));
          color: #ccc;
          font-size: 8px; text-align: center; padding: 8px 2px 2px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .hero.clickable { cursor: pointer; }
        .hero.clickable:hover {
          transform: scale(1.05);
          z-index: 2;
          border-color: rgba(255,255,255,0.3);
          box-shadow: 0 0 12px rgba(255,255,255,0.1);
        }
        .hero.clickable[data-team="ambar"]:hover {
          border-color: #ffb010;
          box-shadow: 0 0 14px rgba(255,176,16,0.3);
        }
        .hero.clickable[data-team="safira"]:hover {
          border-color: #7b9aff;
          box-shadow: 0 0 14px rgba(123,154,255,0.3);
        }
        .hero.disabled {
          filter: grayscale(1) brightness(0.35);
          opacity: 0.35;
          cursor: not-allowed;
        }
        .hero.no-ban-card {
          background: linear-gradient(135deg, rgba(255,68,68,0.15), rgba(0,0,0,0.6));
          border: 2px solid rgba(255,68,68,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero.no-ban-card:hover {
          border-color: #ff5555;
          box-shadow: 0 0 14px rgba(255,68,68,0.4);
        }
        .no-ban-x {
          font-size: 2rem;
          color: #ff5555;
          font-weight: bold;
        }
        .hero.no-ban-card .hero-name {
          color: #ff6666;
        }
        .hero.banned .ban-x {
          position: absolute;
          inset: 0;
          display: block;
        }
        .hero.banned .ban-x::before,
        .hero.banned .ban-x::after {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          width: 140%;
          height: 3px;
          background: #ff4444;
          border-radius: 2px;
        }
        .hero.banned .ban-x::before { transform: translate(-50%, -50%) rotate(45deg); }
        .hero.banned .ban-x::after { transform: translate(-50%, -50%) rotate(-45deg); }

        .muted { color: #555; padding: 0.5rem; }

        .ready-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        .ready-box {
          background: rgba(30, 30, 35, 0.95);
          border: 2px solid rgba(255, 176, 16, 0.4);
          border-radius: 16px;
          padding: 2.5rem 3rem;
          text-align: center;
          box-shadow: 0 0 60px rgba(255, 176, 16, 0.15);
        }
        .ready-box h2 {
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffb010;
          margin: 0 0 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .ready-status {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .ready-status p {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.3s;
        }
        .ready-status p.waiting {
          color: #666;
          background: rgba(255, 255, 255, 0.05);
        }
        .ready-status p.ready {
          color: #7dff7d;
          background: rgba(125, 255, 125, 0.1);
          border: 1px solid rgba(125, 255, 125, 0.3);
        }
        .ready-btn {
          background: linear-gradient(135deg, #927715, #6d5710);
          color: #ffb010;
          border: none;
          border-radius: 10px;
          padding: 1rem 3rem;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          transition: box-shadow 0.3s, transform 0.2s;
        }
        .ready-btn:hover {
          box-shadow: 0 0 30px rgba(255, 176, 16, 0.5);
          transform: translateY(-2px);
        }
        .ready-confirmed {
          color: #7dff7d;
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }
        .team-name-edit {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .team-name-label {
          font-size: 0.9rem;
          color: #999;
          font-weight: 600;
        }
        .team-name-input-row {
          display: flex;
          gap: 0.5rem;
        }
        .team-name-input {
          flex: 1;
          background: #2a2a2a;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          padding: 0.6rem 0.8rem;
          color: #e4e4e4;
          font-size: 1rem;
        }
        .team-name-input::placeholder {
          color: #666;
        }
        .team-name-save {
          background: linear-gradient(135deg, #444, #333);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          padding: 0.6rem 1rem;
          color: #e4e4e4;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .team-name-save:hover:not(:disabled) {
          background: linear-gradient(135deg, #555, #444);
        }
        .team-name-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 800px) {
          .page {
            height: auto;
            min-height: 100vh;
            overflow: auto;
          }
          .layout { grid-template-columns: 1fr; }
          .topbar { flex-wrap: wrap; gap: 0.3rem; }
          .timer-center { order: -1; width: 100%; }
          .phase-right { justify-content: center; }
        }
      `}</style>

      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </>
  )
}

function TeamPanel({ label, team, picks, maxPicks, isActive, currentAction, heroMap, reserveTime, isUsingReserve }) {
  const isAmbar = team === "ambar"
  const teamColor = isAmbar ? "#ffb010" : "#7b9aff"
  const teamColorRgb = isAmbar ? "146,119,21" : "47,77,181"

  function getSlotImageForPick(entry) {
    if (!entry || !heroMap) return null
    const localImage = getLocalHeroImage(entry.name, "pick")
    if (localImage) return localImage
    const hero = heroMap[entry.id]
    return hero ? getHeroImage(hero) : null
  }

  return (
    <aside className={`panel ${isActive ? "active" : ""}`}>
      <div className={`reserve-badge ${isUsingReserve ? "using" : ""}`}>
        Reserva: {reserveTime ?? 0}s
      </div>
      <h2 className={`team-name ${isActive ? "team-active" : ""}`}>{label}</h2>

      <div className="slots">
        {Array.from({ length: maxPicks }).map((_, i) => {
          const isActiveSlot = isActive && currentAction === "pick" && i === picks.length
          const img = getSlotImageForPick(picks[i])
          return (
            <div key={i} className={`slot ${picks[i] ? "filled" : ""} ${isActiveSlot ? "active-slot" : ""}`}>
              {img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={picks[i].name} className="slot-img" />
              )}
              <span className="slot-name">{picks[i] ? picks[i].name : "—"}</span>
            </div>
          )
        })}
      </div>

      
      <style jsx>{`
        .panel {
          background: linear-gradient(${isAmbar ? "135deg" : "225deg"}, rgba(${teamColorRgb},0.08) 0%, rgba(0,0,0,0.3) 100%);
          border-${isAmbar ? "right" : "left"}: 2px solid rgba(${teamColorRgb},0.3);
          padding: 0.75rem 0.6rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          overflow-y: auto;
          min-height: 0;
        }
        .panel.active {
          border-${isAmbar ? "right" : "left"}-color: ${teamColor};
          background: linear-gradient(${isAmbar ? "135deg" : "225deg"}, rgba(${teamColorRgb},0.14) 0%, rgba(0,0,0,0.3) 100%);
        }
        .reserve-badge {
          background: rgba(${teamColorRgb}, 0.15);
          border: 1px solid rgba(${teamColorRgb}, 0.3);
          color: ${teamColor};
          font-size: 0.65rem;
          font-weight: 700;
          text-align: center;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          margin-bottom: 0.3rem;
          flex-shrink: 0;
          opacity: 0.7;
          transition: all 0.3s;
        }
        .reserve-badge.using {
          opacity: 1;
          background: rgba(255, 153, 68, 0.2);
          border-color: rgba(255, 153, 68, 0.5);
          color: #ff9944;
          animation: reservePulse 0.6s infinite alternate;
        }
        @keyframes reservePulse {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0.7; transform: scale(1.02); }
        }
        .team-name {
          color: ${teamColor};
          font-size: 1.1rem;
          font-weight: 900;
          text-transform: uppercase;
          text-align: center;
          margin: 0 0 0.3rem;
          letter-spacing: 0.08em;
          transition: opacity 0.3s;
          flex-shrink: 0;
        }
        .team-active {
          animation: teamPulse 1.2s infinite alternate;
        }
        @keyframes teamPulse {
          from { opacity: 1; }
          to { opacity: 0.65; }
        }
        .slots {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 3px;
        }
        .slot {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(${teamColorRgb},0.25);
          border-radius: 4px;
          padding: 0;
          text-align: center;
          font-size: 0.6rem;
          color: #444;
          font-weight: 600;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
          aspect-ratio: 3/4;
          position: relative;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .slot-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          inset: 0;
        }
        .slot-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.85));
          padding: 8px 3px 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .slot:not(.filled) .slot-name {
          position: static;
          background: none;
          padding: 0;
          margin: auto;
        }
        .slot.filled {
          color: ${teamColor};
          background: rgba(0,0,0,0.6);
          border-color: rgba(${teamColorRgb},0.4);
        }
        .slot.active-slot {
          border-color: ${teamColor};
          box-shadow: 0 0 10px rgba(${teamColorRgb},0.4), inset 0 0 20px rgba(${teamColorRgb},0.05);
          background: linear-gradient(90deg, rgba(${teamColorRgb},0.05), rgba(${teamColorRgb},0.12), rgba(${teamColorRgb},0.05));
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @media (max-width: 800px) {
          .panel { border: none; border-bottom: 2px solid rgba(${teamColorRgb},0.3); }
          .panel.active { border-bottom-color: ${teamColor}; }
        }
      `}</style>
    </aside>
  )
}

function BansRow({ label, team, bans, maxBans, isActive, currentAction, heroMap }) {
  const isAmbar = team === "ambar"
  const teamColor = isAmbar ? "#ffb010" : "#7b9aff"
  const teamColorRgb = isAmbar ? "146,119,21" : "47,77,181"

  function getSlotImageForBan(entry) {
    if (!entry || !heroMap) return null
    const localImage = getLocalHeroImage(entry.name, "ban")
    if (localImage) return localImage
    const hero = heroMap[entry.id]
    return hero ? getHeroImage(hero) : null
  }

  return (
    <div className={`bans-row ${isActive && currentAction === "ban" ? "active" : ""}`}>
      <div className="bans-label">{label}</div>
      <div className="ban-slots">
        {Array.from({ length: maxBans }).map((_, i) => {
          const isActiveSlot = isActive && currentAction === "ban" && i === bans.length
          const entry = bans[i]
          const isNoBan = entry?.noBan || entry?.id === null
          const img = getSlotImageForBan(entry)
          return (
            <div key={i} className={`ban-slot ${entry ? "filled" : ""} ${isActiveSlot ? "active-slot" : ""} ${isNoBan ? "no-ban-slot" : ""}`}>
              {isNoBan ? (
                <span className="no-ban-x-small">✕</span>
              ) : (
                <>
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={entry.name} className="ban-img" />
                  )}
                </>
              )}
              <span className="ban-name">{entry ? entry.name : ""}</span>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .bans-row {
          flex: 1;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(${teamColorRgb}, 0.3);
          border-radius: 6px;
          padding: 0.4rem;
        }
        .bans-row.active {
          border-color: ${teamColor};
          box-shadow: 0 0 10px rgba(${teamColorRgb}, 0.2);
        }
        .bans-label {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
          color: ${teamColor};
          margin-bottom: 0.3rem;
          text-align: center;
        }
        .ban-slots {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 3px;
        }
        .ban-slot {
          flex: 0 0 calc(25% - 3px);
          max-width: calc(25% - 3px);
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          padding: 0;
          font-size: 0.6rem;
          color: #444;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
          aspect-ratio: 3/4;
          position: relative;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ban-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          inset: 0;
        }
        .ban-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.85));
          padding: 6px 2px 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.7rem;
          font-weight: 600;
          color: #888;
        }
        .ban-slot.filled .ban-name {
          color: #ff6666;
          text-decoration: line-through;
        }
        .ban-slot.no-ban-slot .ban-name {
          text-decoration: none;
        }
        .ban-slot.filled {
          border-color: rgba(255,68,68,0.25);
        }
        .ban-slot.no-ban-slot {
          background: linear-gradient(135deg, rgba(255,68,68,0.1), rgba(0,0,0,0.4));
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .no-ban-x-small {
          font-size: 1.5rem;
          color: #ff5555;
          font-weight: bold;
        }
        .ban-slot.active-slot {
          border-color: #ff5555;
          box-shadow: 0 0 8px rgba(255,68,68,0.3);
          animation: shimmer 1.5s infinite linear;
          background: linear-gradient(90deg, rgba(255,68,68,0.03), rgba(255,68,68,0.1), rgba(255,68,68,0.03));
          background-size: 200% 100%;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        `}</style>
    </div>
  )
}
