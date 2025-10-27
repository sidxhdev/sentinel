import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
const PORT = 3000; // ✅ Changed from 5000 to avoid conflict with Flask

app.use(cors());
app.use(express.json());

// Store last face data received from Python
let latestFaceData = { 
  count: 0, 
  people: [], 
  intrusion: false,
  timestamp: null 
};

// WebSocket setup
const wss = new WebSocketServer({ port: 3001 });
console.log("🌐 WebSocket running on ws://localhost:3001");

// Send latest data to all connected clients
function broadcastFaceData() {
  const data = JSON.stringify(latestFaceData);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

// ✅ Endpoint for Python AI to send data
app.post("/face-data", (req, res) => {
  latestFaceData = {
    ...req.body,
    timestamp: new Date().toISOString()
  };
  
  console.log("📦 Face data received:", latestFaceData);
  broadcastFaceData();
  
  res.json({ status: "ok" });
});

// Get latest face data (REST endpoint)
app.get("/face-data", (req, res) => {
  res.json(latestFaceData);
});

// Health check
app.get("/", (req, res) => {
  res.json({ 
    status: "✅ Sentinel API running",
    endpoints: {
      faceData: "POST /face-data",
      latestData: "GET /face-data",
      websocket: "ws://localhost:3001"
    }
  });
});

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("🔗 New WebSocket client connected");
  
  // Send current data immediately on connection
  ws.send(JSON.stringify(latestFaceData));
  
  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected");
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
  console.log(`📡 Python should POST to: http://localhost:${PORT}/face-data`);
});