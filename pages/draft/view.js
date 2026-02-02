"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"

const HEROES_URL = "https://assets.deadlock-api.com/v2/heroes"

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
  const eventSourceRef = useRef(null)

  // Connect to SSE
  useEffect(() => {
    if (!roomId || !token) return

    const es = new EventSource(`/api/v1/draft/${roomId}/stream?token=${token}`)
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

  const sortedHeroes = useMemo(() => {
    return heroes
      .filter((h) => !h.in_development && !h.disabled)
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

  async function pickHero(hero) {
    if (!state || state.finished) return
    if (role === "streamer") return
    if (state.currentTeam !== role) return

    const heroId = getHeroId(hero)
    if (usedIds.has(heroId)) return

    await fetch(`/api/v1/draft/${roomId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, heroId, heroName: getHeroName(hero) }),
    })
  }

  const heroMap = useMemo(() => {
    const map = {}
    for (const h of heroes) {
      const id = getHeroId(h)
      if (id) map[id] = h
    }
    return map
  }, [heroes])

  const canAct = state && !state.finished && role !== "streamer" && state.currentTeam === role
  const isMyTurn = canAct

  // Auto-pick random hero when timer reaches 0
  const autoPickedRef = useRef(null)
  useEffect(() => {
    if (!state || !canAct) return
    if (state.timer.remaining > 0) {
      autoPickedRef.current = null
      return
    }
    // Timer hit 0 and it's our turn — pick a random available hero
    const stepKey = `${state.stepIndex}`
    if (autoPickedRef.current === stepKey) return
    autoPickedRef.current = stepKey

    const available = sortedHeroes.filter((h) => {
      const hid = getHeroId(h)
      return hid && !usedIds.has(hid)
    })
    if (available.length === 0) return
    const random = available[Math.floor(Math.random() * available.length)]
    pickHero(random)
  }, [state, canAct, sortedHeroes, usedIds])

  if (!roomId || !token) {
    return <div style={{ color: "#e4e4e4", padding: "2rem", background: "#111114", minHeight: "100vh" }}>Carregando...</div>
  }

  if (error) {
    return <div style={{ color: "#ff7777", padding: "2rem", background: "#111114", minHeight: "100vh" }}>{error}</div>
  }

  if (!state) {
    return <div style={{ color: "#e4e4e4", padding: "2rem", background: "#111114", minHeight: "100vh" }}>Conectando à sala...</div>
  }

  const phaseLabel = state.finished
    ? "Draft Finalizado"
    : `${state.currentAction === "ban" ? "Ban" : "Pick"} — ${state.currentTeam === "ambar" ? "Âmbar" : "Safira"}`

  const roleLabel = role === "streamer" ? "Streamer" : role === "ambar" ? "Time Âmbar" : "Time Safira"

  const activeTeamColor = state.currentTeam === "ambar" ? "#ffb010" : "#7b9aff"

  return (
    <>
      <Head>
        <title>Draft | Dominokas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#111114" />
      </Head>

      <div className="page">
        <header className="topbar">
          <div className="topbar-left">
            <div className="brand">Draft Multiplayer</div>
            <div className="role-badge" data-role={role}>{roleLabel}</div>
          </div>
          <div className="timer-center">
            <span className={`timer ${state.timer.remaining <= 5 ? "urgent" : ""}`}>
              {state.timer.remaining}s
            </span>
            {isMyTurn && <span className="your-turn">SUA VEZ!</span>}
          </div>
          <div className="phase-right">
            <span className="phase-label" style={{ color: activeTeamColor }}>{phaseLabel}</span>
            <span className="step">{state.stepIndex + 1}/{state.totalSteps}</span>
          </div>
        </header>

        <main className="layout">
          <TeamPanel
            label="Âmbar"
            team="ambar"
            picks={state.ambar.picks}
            bans={state.ambar.bans}
            maxPicks={state.config.picks}
            maxBans={state.config.bans}
            isActive={state.currentTeam === "ambar" && !state.finished}
            currentAction={state.currentAction}
            heroMap={heroMap}
          />

          <section className="center">
            <div className="grid">
              {heroesLoading && <div className="muted">Carregando heróis...</div>}
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
          </section>

          <TeamPanel
            label="Safira"
            team="safira"
            picks={state.safira.picks}
            bans={state.safira.bans}
            maxPicks={state.config.picks}
            maxBans={state.config.bans}
            isActive={state.currentTeam === "safira" && !state.finished}
            currentAction={state.currentAction}
            heroMap={heroMap}
          />
        </main>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
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
          padding: 0.6rem 1.2rem;
          background: rgba(0,0,0,0.6);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .brand { font-weight: 700; font-size: 1rem; color: #999; }
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }
        .timer-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          flex: 0 0 auto;
        }
        .timer {
          font-size: 2.2rem;
          font-weight: 900;
          font-variant-numeric: tabular-nums;
          color: #e4e4e4;
          transition: color 0.3s;
          line-height: 1;
        }
        .timer.urgent { color: #ff4444; animation: pulse 0.5s infinite alternate; }
        .your-turn {
          background: rgba(255,255,255,0.12);
          padding: 0.15rem 0.6rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          animation: pulse 0.7s infinite alternate;
        }
        .phase-right {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex: 1;
          justify-content: flex-end;
        }
        .phase-label {
          font-weight: 800;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .step { font-size: 0.8rem; opacity: 0.5; color: #e4e4e4; }
        .role-badge {
          padding: 0.2rem 0.65rem;
          border-radius: 999px;
          font-size: 0.8rem;
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
          grid-template-columns: 260px 1fr 260px;
          gap: 0;
          min-height: calc(100vh - 52px);
        }

        .center {
          padding: 0.75rem;
          overflow-y: auto;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
          gap: 6px;
        }
        .hero {
          position: relative;
          aspect-ratio: 3/4;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.06);
          background: #0a0a0c;
          cursor: default;
          padding: 0;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hero .fallback { display: grid; place-items: center; height: 100%; padding: 4px; font-size: 10px; color: #666; text-align: center; }
        .hero-name {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.85));
          color: #ccc;
          font-size: 9px; text-align: center; padding: 10px 3px 3px;
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

        .muted { color: #555; padding: 1rem; }

        @media (max-width: 800px) {
          .layout { grid-template-columns: 1fr; }
          .topbar { flex-wrap: wrap; gap: 0.5rem; }
          .timer-center { order: -1; width: 100%; }
          .phase-right { justify-content: center; }
        }
      `}</style>
    </>
  )
}

function TeamPanel({ label, team, picks, bans, maxPicks, maxBans, isActive, currentAction, heroMap }) {
  const isAmbar = team === "ambar"
  const teamColor = isAmbar ? "#ffb010" : "#7b9aff"
  const teamColorRgb = isAmbar ? "146,119,21" : "47,77,181"

  function getSlotImage(entry) {
    if (!entry || !heroMap) return null
    const hero = heroMap[entry.id]
    return hero ? getHeroImage(hero) : null
  }

  return (
    <aside className={`panel ${isActive ? "active" : ""}`}>
      <h2 className={`team-name ${isActive ? "team-active" : ""}`}>{label}</h2>

      <div className="section-label">Picks</div>
      <div className="slots">
        {Array.from({ length: maxPicks }).map((_, i) => {
          const isActiveSlot = isActive && currentAction === "pick" && i === picks.length
          const img = getSlotImage(picks[i])
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

      <div className="section-label">Bans</div>
      <div className="ban-slots">
        {Array.from({ length: maxBans }).map((_, i) => {
          const isActiveSlot = isActive && currentAction === "ban" && i === bans.length
          const img = getSlotImage(bans[i])
          return (
            <div key={i} className={`ban-slot ${bans[i] ? "filled" : ""} ${isActiveSlot ? "active-slot" : ""}`}>
              {img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={bans[i].name} className="ban-img" />
              )}
              <span className="ban-name">{bans[i] ? bans[i].name : "—"}</span>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .panel {
          background: linear-gradient(${isAmbar ? "135deg" : "225deg"}, rgba(${teamColorRgb},0.08) 0%, rgba(0,0,0,0.3) 100%);
          border-${isAmbar ? "right" : "left"}: 2px solid rgba(${teamColorRgb},0.3);
          padding: 1.2rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .panel.active {
          border-${isAmbar ? "right" : "left"}-color: ${teamColor};
          background: linear-gradient(${isAmbar ? "135deg" : "225deg"}, rgba(${teamColorRgb},0.14) 0%, rgba(0,0,0,0.3) 100%);
        }
        .team-name {
          color: ${teamColor};
          font-size: 1.3rem;
          font-weight: 900;
          text-transform: uppercase;
          text-align: center;
          margin: 0 0 0.5rem;
          letter-spacing: 0.08em;
          transition: opacity 0.3s;
        }
        .team-active {
          animation: teamPulse 1.2s infinite alternate;
        }
        @keyframes teamPulse {
          from { opacity: 1; }
          to { opacity: 0.65; }
        }
        .section-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #666;
          font-weight: 700;
          margin-top: 0.25rem;
        }
        .slots {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
        }
        .slot {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(${teamColorRgb},0.25);
          border-radius: 6px;
          padding: 0;
          text-align: center;
          font-size: 0.7rem;
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
          padding: 8px 3px 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.65rem;
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

        .ban-slots {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
        }
        .ban-slot {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          padding: 0;
          font-size: 0.7rem;
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
          filter: grayscale(0.6) brightness(0.55);
          position: absolute;
          inset: 0;
        }
        .ban-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.85));
          padding: 8px 3px 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.65rem;
        }
        .ban-slot:not(.filled) .ban-name {
          position: static;
          background: none;
          padding: 0;
          margin: auto;
        }
        .ban-slot.filled { color: #ff5555; border-color: rgba(255,68,68,0.25); }
        .ban-slot.filled .ban-name { text-decoration: line-through; }
        .ban-slot.active-slot {
          border-color: #ff5555;
          box-shadow: 0 0 8px rgba(255,68,68,0.3);
          animation: shimmer 1.5s infinite linear;
          background: linear-gradient(90deg, rgba(255,68,68,0.03), rgba(255,68,68,0.1), rgba(255,68,68,0.03));
          background-size: 200% 100%;
        }

        @media (max-width: 800px) {
          .panel { border: none; border-bottom: 2px solid rgba(${teamColorRgb},0.3); }
          .panel.active { border-bottom-color: ${teamColor}; }
        }
      `}</style>
    </aside>
  )
}
