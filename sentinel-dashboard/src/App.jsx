import { useState, useEffect } from "react";
import axios from "axios";
import DetectionStatus from "./components/DetectionStatus";
import CameraFeed from "./components/CameraFeed";

export default function App() {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem("esp32ip") || "");
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(!!localStorage.getItem("esp32ip"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStatus = async () => {
    if (!apiUrl) return;
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/api/status`);
      setData(res.data);
      setError("");
    } catch {
      setError("⚠️ Unable to connect to ESP32 or backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!connected) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [apiUrl, connected]);

  const handleConnect = () => {
    if (!apiUrl.trim()) return alert("Please enter ESP32 or API URL");
    localStorage.setItem("esp32ip", apiUrl.trim());
    setConnected(true);
    fetchStatus();
  };

  const handleDisconnect = () => {
    localStorage.removeItem("esp32ip");
    setConnected(false);
    setApiUrl("");
    setData(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      {!connected ? (
        <div className="text-center">
          <h1 className="text-5xl font-bold text-blue-400 mb-4">Welcome to Sentinel</h1>
          <p className="text-gray-400 mb-8">
            Your intelligent intrusion detection dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <input
              type="text"
              placeholder="Enter Esp32 http address"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="px-4 py-2 w-80 rounded bg-gray-900 text-gray-200 border border-gray-700 focus:outline-none"
            />
            <button
              onClick={handleConnect}
              className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
            >
              Connect
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <h1 className="text-3xl font-bold text-blue-400 mb-4">Sentinel Dashboard</h1>
          <p className="text-gray-500 mb-6">Connected to: {apiUrl}</p>

          {loading && <p>Fetching status...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {data && (
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 w-full max-w-2xl">
              <DetectionStatus status={data.status} time={data.time} />
              <CameraFeed streamUrl={data.image} />
            </div>
          )}

          <button
            onClick={handleDisconnect}
            className="mt-8 bg-red-600 px-5 py-2 rounded hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
