import { useState, useEffect } from "react";
import LiveFeed from "./components/LiveFeed";
import FaceStats from "./components/FaceStats";
import IntrusionAlert from "./components/IntrusionAlert";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [people, setPeople] = useState([]);
  const [intrusion, setIntrusion] = useState(false);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onopen = () => {
      console.log("✅ Connected to WebSocket");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setFaceCount(data.count || 0);
        setPeople(data.people || []);
        setIntrusion(data.intrusion || false);
      } catch (err) {
        console.error("❌ Error parsing WebSocket data:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log("⚠️ WebSocket disconnected");
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      {!connected ? (
        <div className="text-center">
          <h1 className="text-5xl font-bold text-blue-400 mb-6">Welcome to Sentinel</h1>
          <p className="text-gray-400 mb-8">Connecting to AI feed...</p>
          <div className="animate-pulse">
            <div className="h-4 w-48 bg-gray-700 rounded mx-auto"></div>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-bold text-blue-400 mb-6">🛡️ Sentinel AI Security</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            {/* Live Feed */}
            <div className="lg:col-span-2">
              <LiveFeed />
            </div>
            {/* Right Panels */}
            <div className="flex flex-col gap-6">
              <FaceStats faceCount={faceCount} people={people} />
              <IntrusionAlert intrusion={intrusion} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}