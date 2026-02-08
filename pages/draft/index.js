"use client"

import { useState } from "react"
import Head from "next/head"

export default function DraftCreate() {
  const [timer, setTimer] = useState("40")
  const [reserveTime, setReserveTime] = useState("60")
  const [links, setLinks] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null)

  async function create() {
    setLoading(true)
    try {
      const res = await fetch("/api/v1/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bans: 2, picks: 6, timerSeconds: timer === "" ? 40 : Number(timer), reserveSeconds: reserveTime === "" ? 60 : Number(reserveTime) }),
      })
      const data = await res.json()
      setLinks(data.links)
    } catch {
      alert("Erro ao criar sala")
    } finally {
      setLoading(false)
    }
  }

  function copy(url, key) {
    navigator.clipboard.writeText(url)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <>
      <Head>
        <title>Criar Draft | Dominokas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1B1B1B" />
      </Head>

      <div className="page">
        <div className="card">
          <h1 className="title">Draft de Heróis</h1>
          <p className="sub">Configure e crie uma sala de draft multiplayer</p>

          {!links ? (
            <div className="form">
              <label>
                <span>Timer por turno (segundos)</span>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={timer}
                  onChange={(e) => setTimer(e.target.value)}
                />
              </label>
              <label>
                <span>Tempo reserva por time (segundos)</span>
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={reserveTime}
                  onChange={(e) => setReserveTime(e.target.value)}
                />
              </label>
              <button className="btn-create" onClick={create} disabled={loading}>
                {loading ? "Criando..." : "Criar Sala"}
              </button>
            </div>
          ) : (
            <div className="links">
              <p className="success">Sala criada! Compartilhe os links:</p>
              {[
                { key: "streamer", label: "Streamer (Overview)", color: "#e4e4e4" },
                { key: "ambar", label: "Time Âmbar", color: "#ffb010" },
                { key: "safira", label: "Time Safira", color: "#a9bdff" },
              ].map(({ key, label, color }) => (
                <div key={key} className="link-row">
                  <span className="link-label" style={{ color }}>{label}</span>
                  <input readOnly value={links[key]} className="link-input" />
                  <button className="btn-copy" onClick={() => copy(links[key], key)}>
                    {copied === key ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              ))}
              <button className="btn-new" onClick={() => setLinks(null)}>
                Criar outra sala
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #1b1b1b url('/images/background.png') center/cover no-repeat fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .card {
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 2.5rem;
          max-width: 520px;
          width: 100%;
          color: #e4e4e4;
        }
        .title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffb010;
          margin: 0 0 0.5rem;
          text-align: center;
        }
        .sub {
          text-align: center;
          color: #9aa0a6;
          margin: 0 0 2rem;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-weight: 600;
        }
        label span { color: #ccc; font-size: 0.9rem; }
        input[type="number"] {
          background: #2a2a2a;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          padding: 0.6rem 0.8rem;
          color: #e4e4e4;
          font-size: 1rem;
        }
        .btn-create {
          margin-top: 0.5rem;
          background: linear-gradient(135deg, #927715, #6d5710);
          color: #ffb010;
          border: none;
          border-radius: 10px;
          padding: 0.8rem;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .btn-create:hover { box-shadow: 0 0 20px rgba(146,119,21,0.5); }
        .btn-create:disabled { opacity: 0.6; cursor: default; }
        .links { display: flex; flex-direction: column; gap: 1rem; }
        .success { color: #7dff7d; font-weight: 600; text-align: center; }
        .link-row { display: flex; flex-direction: column; gap: 0.3rem; }
        .link-label { font-weight: 700; font-size: 0.95rem; }
        .link-input {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 0.5rem;
          color: #bbb;
          font-size: 0.8rem;
        }
        .btn-copy {
          align-self: flex-end;
          background: #2a2a2a;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          color: #e4e4e4;
          padding: 0.3rem 0.8rem;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .btn-copy:hover { background: #3a3a3a; }
        .btn-new {
          margin-top: 1rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          color: #ccc;
          padding: 0.6rem;
          cursor: pointer;
          font-size: 0.95rem;
        }
        .btn-new:hover { background: rgba(255,255,255,0.05); }
      `}</style>
    </>
  )
}
