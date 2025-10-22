import { setAlert } from "../shared/alertStore.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { status, image } = req.body || {};
    setAlert(status || "motion detected", image || null);

    return res.status(200).json({
      success: true,
      message: "Alert received successfully",
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
