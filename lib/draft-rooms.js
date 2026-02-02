const { randomUUID } = require("crypto")

/** @type {Map<string, Room>} */
if (!global.__draftRooms) global.__draftRooms = new Map()
const rooms = global.__draftRooms

function generateSequence(bans, picks) {
  const seq = []
  // Bans: alternating, ambar starts
  for (let i = 0; i < bans * 2; i++) {
    seq.push({ type: "ban", team: i % 2 === 0 ? "ambar" : "safira" })
  }
  // Picks: snake draft pattern (1-1-2-2-2-2-2-2-1-1 style)
  // For 6 picks each (12 total): A,S,A,S,S,A,S,A,A,S,S,A
  const snakePattern = []
  for (let i = 0; i < picks; i++) {
    if (i < 2) {
      snakePattern.push("ambar", "safira")
    } else {
      snakePattern.push("safira", "ambar")
    }
  }
  // More standard snake: A,S,A,S, S,A,S,A, A,S,S,A
  // Actually let's do proper 1-2-2-2... snake
  const pickSeq = []
  let current = "ambar"
  let countA = 0
  let countS = 0
  // Simple snake: first pick ambar, then alternate in pairs
  // A, S, S, A, A, S, S, A, A, S, S, A => 6 each for picks=6
  // Or: A,S, A,S, S,A, S,A, A,S, S,A => from plan
  // Plan says: A,S,A,S,S,A,S,A,A,S,S,A for 6 picks each
  const planPicks = []
  // Generate based on standard snake: groups of 2, alternating start
  let team = "ambar"
  let total = picks * 2
  let i = 0
  // First 4: A,S,A,S (1-1-1-1), then pairs: S,A,S,A,A,S,S,A
  // Actually, simpler: 1-1 then 2-2-2... snake
  // Standard competitive: A,S, then S,A, then A,S, then S,A...
  // Let's just do: first pair normal, then snake pairs
  planPicks.push(
    { type: "pick", team: "ambar" },
    { type: "pick", team: "safira" },
  )
  let remaining = total - 2
  team = "safira" // last was safira, snake means safira again
  while (remaining > 0) {
    planPicks.push({ type: "pick", team })
    remaining--
    if (remaining > 0) {
      const other = team === "ambar" ? "safira" : "ambar"
      planPicks.push({ type: "pick", team: other })
      remaining--
      team = other // next pair starts with this team repeated
    }
  }

  return [...seq, ...planPicks]
}

function createRoom(config) {
  const { bans = 4, picks = 6, timerSeconds = 40 } = config || {}
  const id = randomUUID().slice(0, 8)
  const tokens = {
    ambar: randomUUID().slice(0, 12),
    safira: randomUUID().slice(0, 12),
    streamer: randomUUID().slice(0, 12),
  }
  const sequence = generateSequence(bans, picks)
  const room = {
    id,
    config: { bans, picks, timerSeconds },
    tokens,
    clients: new Set(),
    state: {
      phase: "ban",
      currentTeam: "ambar",
      stepIndex: 0,
      sequence,
      ambar: { picks: [], bans: [] },
      safira: { picks: [], bans: [] },
      timer: { remaining: timerSeconds, running: false },
    },
    timerInterval: null,
    lastActivity: Date.now(),
  }
  rooms.set(id, room)
  startTimer(room)
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
    phase: room.state.phase,
    currentTeam: step ? step.team : null,
    currentAction: step ? step.type : null,
    stepIndex: room.state.stepIndex,
    totalSteps: room.state.sequence.length,
    ambar: room.state.ambar,
    safira: room.state.safira,
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
    clearInterval(room.timerInterval)
    room.timerInterval = null
  } else {
    const step = room.state.sequence[room.state.stepIndex]
    room.state.phase = step.type
    room.state.currentTeam = step.team
    room.state.timer.remaining = room.config.timerSeconds
    room.state.timer.running = true
  }
  broadcast(room)
}

function startTimer(room) {
  if (room.timerInterval) clearInterval(room.timerInterval)
  room.state.timer.running = true
  room.state.timer.remaining = room.config.timerSeconds
  room.timerInterval = setInterval(() => {
    if (!room.state.timer.running) return
    room.state.timer.remaining--
    if (room.state.timer.remaining <= 0) {
      // Auto-skip
      advanceStep(room)
    } else {
      broadcast(room)
    }
  }, 1000)
}

function performAction(room, team, heroId, heroName) {
  const step = room.state.sequence[room.state.stepIndex]
  if (!step) return { error: "Draft já finalizado" }
  if (step.team !== team) return { error: "Não é a vez deste time" }

  // Check if hero already used
  const allUsed = [
    ...room.state.ambar.picks,
    ...room.state.ambar.bans,
    ...room.state.safira.picks,
    ...room.state.safira.bans,
  ]
  if (allUsed.some((h) => h.id === heroId)) {
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
}
