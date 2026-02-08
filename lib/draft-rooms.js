const { randomUUID } = require("crypto")

/** @type {Map<string, Room>} */
if (!global.__draftRooms) global.__draftRooms = new Map()
const rooms = global.__draftRooms

function generateSequence() {
  // Sequência fixa: ban A, ban S, pick A, pick S, pick S, pick A, pick A, pick S,
  //                 ban S, ban A, pick S, pick A, pick A, pick S, pick S, pick A
  return [
    { type: "ban", team: "ambar" },
    { type: "ban", team: "safira" },
    { type: "pick", team: "ambar" },
    { type: "pick", team: "safira" },
    { type: "pick", team: "safira" },
    { type: "pick", team: "ambar" },
    { type: "pick", team: "ambar" },
    { type: "pick", team: "safira" },
    { type: "ban", team: "safira" },
    { type: "ban", team: "ambar" },
    { type: "pick", team: "safira" },
    { type: "pick", team: "ambar" },
    { type: "pick", team: "ambar" },
    { type: "pick", team: "safira" },
    { type: "pick", team: "safira" },
    { type: "pick", team: "ambar" },
  ]
}

function createRoom(config) {
  const { bans = 2, picks = 6, timerSeconds = 40, reserveSeconds = 60 } = config || {}
  const id = randomUUID().slice(0, 8)
  const tokens = {
    ambar: randomUUID().slice(0, 12),
    safira: randomUUID().slice(0, 12),
    streamer: randomUUID().slice(0, 12),
  }
  const sequence = generateSequence()
  const room = {
    id,
    config: { bans, picks, timerSeconds, reserveSeconds },
    tokens,
    clients: new Set(),
    state: {
      started: false,
      ambarReady: false,
      safiraReady: false,
      phase: "ban",
      currentTeam: "ambar",
      stepIndex: 0,
      sequence,
      ambar: { picks: [], bans: [], reserveTime: reserveSeconds },
      safira: { picks: [], bans: [], reserveTime: reserveSeconds },
      timer: { remaining: timerSeconds, running: false, usingReserve: false },
    },
    timerInterval: null,
    lastActivity: Date.now(),
  }
  rooms.set(id, room)
  return room
}

function getRoom(roomId) {
  const room = rooms.get(roomId)
  if (room) room.lastActivity = Date.now()
  return room || null
}

function getRoleFromToken(room, token) {
  if (room.tokens.ambar === token) return "ambar"
  if (room.tokens.safira === token) return "safira"
  if (room.tokens.streamer === token) return "streamer"
  return null
}

function getPublicState(room) {
  const step = room.state.sequence[room.state.stepIndex]
  return {
    started: room.state.started,
    ambarReady: room.state.ambarReady,
    safiraReady: room.state.safiraReady,
    phase: room.state.phase,
    currentTeam: step ? step.team : null,
    currentAction: step ? step.type : null,
    stepIndex: room.state.stepIndex,
    totalSteps: room.state.sequence.length,
    sequence: room.state.sequence,
    ambar: {
      picks: room.state.ambar.picks,
      bans: room.state.ambar.bans,
      reserveTime: room.state.ambar.reserveTime,
    },
    safira: {
      picks: room.state.safira.picks,
      bans: room.state.safira.bans,
      reserveTime: room.state.safira.reserveTime,
    },
    timer: room.state.timer,
    config: room.config,
    finished: room.state.stepIndex >= room.state.sequence.length,
  }
}

function broadcast(room) {
  const data = JSON.stringify(getPublicState(room))
  for (const res of room.clients) {
    try {
      res.write(`data: ${data}\n\n`)
      res.flush?.()
    } catch (_) {
      room.clients.delete(res)
    }
  }
}

function advanceStep(room) {
  room.state.stepIndex++
  if (room.state.stepIndex >= room.state.sequence.length) {
    room.state.phase = "finished"
    room.state.timer.running = false
    room.state.timer.usingReserve = false
    clearInterval(room.timerInterval)
    room.timerInterval = null
  } else {
    const step = room.state.sequence[room.state.stepIndex]
    room.state.phase = step.type
    room.state.currentTeam = step.team
    room.state.timer.remaining = room.config.timerSeconds
    room.state.timer.running = true
    room.state.timer.usingReserve = false
  }
  broadcast(room)
}

function startTimer(room) {
  if (room.timerInterval) clearInterval(room.timerInterval)
  room.state.timer.running = true
  room.state.timer.remaining = room.config.timerSeconds
  room.state.timer.usingReserve = false
  room.timerInterval = setInterval(() => {
    if (!room.state.timer.running) return

    const step = room.state.sequence[room.state.stepIndex]
    const currentTeam = step ? step.team : null

    if (room.state.timer.remaining > 0) {
      // Timer principal ainda tem tempo
      room.state.timer.remaining--
      broadcast(room)
    } else if (currentTeam && room.state[currentTeam].reserveTime > 0) {
      // Timer principal acabou, usar tempo reserva
      room.state.timer.usingReserve = true
      room.state[currentTeam].reserveTime--
      broadcast(room)
    } else {
      // Tempo reserva também acabou, auto-skip
      advanceStep(room)
    }
  }, 1000)
}

function startDraft(room) {
  if (room.state.started) return { error: "Draft já iniciado" }
  room.state.started = true
  startTimer(room)
  broadcast(room)
  return { ok: true }
}

function setReady(room, team) {
  if (room.state.started) return { error: "Draft já iniciado" }
  if (team !== "ambar" && team !== "safira") return { error: "Time inválido" }

  room.state[`${team}Ready`] = true

  // Auto-start quando ambos estão prontos
  if (room.state.ambarReady && room.state.safiraReady) {
    room.state.started = true
    startTimer(room)
  }

  broadcast(room)
  return { ok: true }
}

function performAction(room, team, heroId, heroName, noBan = false) {
  if (!room.state.started) return { error: "Draft ainda não iniciado" }
  const step = room.state.sequence[room.state.stepIndex]
  if (!step) return { error: "Draft já finalizado" }
  if (step.team !== team) return { error: "Não é a vez deste time" }

  // Se é "noBan", avançar sem adicionar nenhum herói ao ban
  if (noBan && step.type === "ban") {
    // Adiciona um registro de "sem ban" para manter histórico
    room.state[team].bans.push({ id: null, name: "Sem Ban", noBan: true })
    advanceStep(room)
    return { ok: true }
  }

  // Check if hero already used
  const allUsed = [
    ...room.state.ambar.picks,
    ...room.state.ambar.bans,
    ...room.state.safira.picks,
    ...room.state.safira.bans,
  ]
  if (allUsed.some((h) => h.id === heroId && h.id !== null)) {
    return { error: "Herói já utilizado" }
  }

  const hero = { id: heroId, name: heroName }
  if (step.type === "ban") {
    room.state[team].bans.push(hero)
  } else {
    room.state[team].picks.push(hero)
  }

  advanceStep(room)
  return { ok: true }
}

// Cleanup expired rooms every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [id, room] of rooms) {
    if (now - room.lastActivity > 20 * 60 * 1000) {
      if (room.timerInterval) clearInterval(room.timerInterval)
      for (const res of room.clients) {
        try { res.end() } catch (_) {}
      }
      rooms.delete(id)
    }
  }
}, 5 * 60 * 1000)

module.exports = {
  createRoom,
  getRoom,
  getRoleFromToken,
  getPublicState,
  performAction,
  broadcast,
  startDraft,
  setReady,
}
