import { setAlert } from "../shared/alertStore.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { status, image } = req.body || {};

    const data = {
      status: status || "unknown",
      image: image || null,
      time: new Date().toISOString()
    };

    setAlert(data);
    console.log("📥 Alert received:", data);

    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
