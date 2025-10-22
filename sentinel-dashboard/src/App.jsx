import { useState, useEffect } from "react";
import axios from "axios";
import DetectionStatus from "./components/DetectionStatus";
import CameraFeed from "./components/CameraFeed";

export default function App() {
  const BACKEND_URL = "https://sentinel-api-omega.vercel.app"; // 🔗 Vercel backend

  const [esp32Url, setEsp32Url] = useState(localStorage.getItem("esp32Url") || "");
  const [connected, setConnected] = useState(!!localStorage.getItem("esp32Url"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // === Fetch system status from backend ===
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/status`);
      setData(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("⚠️ Unable to connect to backend");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // === Auto refresh every 5 seconds ===
  useEffect(() => {
    if (!connected) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [connected]);

  // === Save ESP32 IP to backend ===
  const handleConnect = async () => {
    if (!esp32Url.trim()) return alert("Please enter ESP32 camera HTTP address");

    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/config`, { esp32Url: esp32Url.trim() });

      localStorage.setItem("esp32Url", esp32Url.trim());
      setConnected(true);
      setError("");
      fetchStatus();
    } catch (err) {
      console.error(err);
      alert("❌ Unable to save ESP32 address to backend");
    } finally {
      setLoading(false);
    }
  };

  // === Disconnect ===
  const handleDisconnect = async () => {
    localStorage.removeItem("esp32Url");
    setConnected(false);
    setEsp32Url("");
    setData(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      {/* ==================== WELCOME SCREEN ==================== */}
      {!connected ? (
        <div className="text-center max-w-lg">
          <h1 className="text-5xl font-bold text-blue-400 mb-4">Welcome to Sentinel</h1>
          <p className="text-gray-400 mb-8">
            Your intelligent intrusion detection dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <input
              type="text"
              placeholder="Enter ESP32 http:// address"
              value={esp32Url}
              onChange={(e) => setEsp32Url(e.target.value)}
              className="px-4 py-2 w-80 rounded bg-gray-900 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleConnect}
              className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 transition-all"
              disabled={loading}
            >
              {loading ? "Connecting..." : "Connect"}
            </button>
          </div>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          <button
            onClick={fetchStatus}
            className="mt-6 bg-gray-800 px-5 py-2 rounded hover:bg-gray-700"
          >
            Test Backend Connection
          </button>
        </div>
      ) : (
        /* ==================== DASHBOARD ==================== */
        <div className="w-full flex flex-col items-center">
          <h1 className="text-3xl font-bold text-blue-400 mb-4">Sentinel Dashboard</h1>
          <p className="text-gray-500 mb-6">
            Backend:{" "}
            <span className="text-gray-300">{BACKEND_URL}</span>
            <br />
            ESP32:{" "}
            <span className="text-gray-300">
              {esp32Url || "Not configured"}
            </span>
          </p>

          {!error && (
            <p className="text-green-400 mb-4">✅ Backend connection active</p>
          )}

          {loading && <p>Fetching status...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {data && (
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 w-full max-w-2xl">
              <DetectionStatus status={data.status} time={data.time} />
              <CameraFeed streamUrl={data.image || `${esp32Url}/stream`} />
            </div>
          )}

          <button
            onClick={handleDisconnect}
            className="mt-8 bg-red-600 px-5 py-2 rounded hover:bg-red-700 transition-all"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
