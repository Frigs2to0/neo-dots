const { createRoom } = require("../../../../lib/draft-rooms")

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { bans, picks, timerSeconds, reserveSeconds } = req.body || {}
  const room = createRoom({ bans, picks, timerSeconds, reserveSeconds })

  const base = `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`

  res.status(201).json({
    roomId: room.id,
    links: {
      streamer: `${base}/draft/view?room=${room.id}&token=${room.tokens.streamer}`,
      ambar: `${base}/draft/view?room=${room.id}&token=${room.tokens.ambar}`,
      safira: `${base}/draft/view?room=${room.id}&token=${room.tokens.safira}`,
    },
  })
}
