export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    const { type, time, image } = req.body || {};
    console.log("🚨 Alert received:", { type, time, image });

    return res.status(200).json({
      success: true,
      message: "Alert received successfully 🚨",
      data: {
        type: type || "unknown",
        time: time || new Date().toISOString(),
        image: image || null,
      },
    });
  }

  if (req.method === "GET") {
    return res.status(200).json({
      message: "✅ Alert endpoint active. Send POST to report events.",
    });
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
