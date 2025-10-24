export default function handler(req, res) {
  res.status(200).json({
    message: "✅ Sentinel backend is live and running!",
    time: new Date().toISOString(),
  });
}
