let lastAlert = { status: "idle", image: null, time: null };

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { status, image } = req.body || {};
    lastAlert = {
      status: status || "unknown",
      image: image || null,
      time: new Date().toISOString()
    };
    console.log("📥 Alert received:", lastAlert);
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}

export { lastAlert };
