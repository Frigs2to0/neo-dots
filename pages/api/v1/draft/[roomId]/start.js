const { getRoom, getRoleFromToken, startDraft } = require("../../../../../lib/draft-rooms")

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { roomId } = req.query
  const { token } = req.body

  const room = getRoom(roomId)
  if (!room) return res.status(404).json({ error: "Sala nao encontrada" })

  const role = getRoleFromToken(room, token)
  if (role !== "streamer") {
    return res.status(403).json({ error: "Apenas o streamer pode iniciar" })
  }

  const result = startDraft(room)
  if (result.error) return res.status(400).json(result)

  return res.json({ ok: true })
}
