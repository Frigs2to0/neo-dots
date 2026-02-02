const { getRoom, getRoleFromToken, getPublicState } = require("../../../../../lib/draft-rooms")

export const config = {
  api: { bodyParser: false },
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { roomId, token } = req.query
  const room = getRoom(roomId)
  if (!room) return res.status(404).json({ error: "Sala não encontrada" })

  const role = getRoleFromToken(room, token)
  if (!role) return res.status(403).json({ error: "Token inválido" })

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  })
  res.flushHeaders()

  // Send initial state + role
  const initial = { ...getPublicState(room), role }
  res.write(`data: ${JSON.stringify(initial)}\n\n`)
  res.flush?.()

  room.clients.add(res)

  req.on("close", () => {
    room.clients.delete(res)
  })
}
