const { getRoom, getRoleFromToken, performAction } = require("../../../../../lib/draft-rooms")

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { roomId } = req.query
  const room = getRoom(roomId)
  if (!room) return res.status(404).json({ error: "Sala não encontrada" })

  const { token, heroId, heroName } = req.body || {}
  const role = getRoleFromToken(room, token)
  if (!role || role === "streamer") {
    return res.status(403).json({ error: "Sem permissão para esta ação" })
  }

  const result = performAction(room, role, heroId, heroName)
  if (result.error) return res.status(400).json(result)
  res.json({ ok: true })
}
