let esp32Url = null;

export const config = { runtime: "edge" };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    const body = await req.json();
    esp32Url = body.esp32Url;
    return res.status(200).json({ message: "ESP32 URL saved", esp32Url });
  }

  if (req.method === "GET") {
    return res.status(200).json({ esp32Url });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
