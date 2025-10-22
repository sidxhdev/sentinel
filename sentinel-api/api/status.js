// api/status.js
import { getAlert } from "../shared/alertStore.js";

export default function handler(req, res) {
  // ✅ Enable CORS for all origins
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Get latest alert
  const alert = getAlert();

  return res.status(200).json(alert);
}
