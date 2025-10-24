let esp32IP = null;

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    const { ip } = req.body || {};
    if (!ip) return res.status(400).json({ error: "IP address required" });
    esp32IP = ip;
    console.log("💾 ESP32 IP updated:", ip);
    return res.status(200).json({ success: true, message: "IP saved", ip });
  }

  if (req.method === "GET") {
    return res.status(200).json({
      message: "Current ESP32 IP",
      ip: esp32IP || "Not configured yet",
    });
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
