const { getRoom, getRoleFromToken, setReady } = require("../../../../../lib/draft-rooms")

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { roomId } = req.query
  const room = getRoom(roomId)
  if (!room) return res.status(404).json({ error: "Sala não encontrada" })

  const { token } = req.body || {}
  const role = getRoleFromToken(room, token)

  if (role !== "ambar" && role !== "safira") {
    return res.status(403).json({ error: "Apenas times podem confirmar" })
  }

  const result = setReady(room, role)
  if (result.error) return res.status(400).json(result)
  res.json({ ok: true })
}
