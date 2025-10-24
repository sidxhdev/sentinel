import { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = "https://sentinel-backend-seven.vercel.app";



export default function App() {
  const [esp32Url, setEsp32Url] = useState(localStorage.getItem("esp32Url") || "");
  const [connected, setConnected] = useState(!!esp32Url);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch status from backend
  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/status`);
      setStatus(res.data);
      setError("");
    } catch (err) {
      setError("Unable to connect to backend");
    }
  };

  useEffect(() => {
    if (connected) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [connected]);

  const handleConnect = () => {
    if (!esp32Url.trim()) {
      alert("Please enter your ESP32 http address first!");
      return;
    }
    localStorage.setItem("esp32Url", esp32Url.trim());
    setConnected(true);
  };

  const handleDisconnect = () => {
    localStorage.removeItem("esp32Url");
    setConnected(false);
    setEsp32Url("");
    setStatus(null);
  };

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/status`);
      if (res.status === 200) alert("Backend is reachable and working!");
    } catch {
      alert("Unable to connect to the provided backend URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      {!connected ? (
        <div className="text-center">
          <h1 className="text-5xl font-bold text-blue-400 mb-4">
            Welcome to Sentinel
          </h1>
          <p className="text-gray-400 mb-8">
            Your intelligent intrusion detection dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <input
              type="text"
              placeholder="Enter ESP32 http:// address"
              value={esp32Url}
              onChange={(e) => setEsp32Url(e.target.value)}
              className="px-4 py-2 w-80 rounded bg-gray-900 text-gray-200 border border-gray-700 focus:outline-none"
            />
            <button
              onClick={handleConnect}
              className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
            >
              Connect
            </button>
          </div>

          {error && <p className="text-red-500 mt-6">{error}</p>}

          <button
            onClick={testBackendConnection}
            className="mt-6 bg-gray-800 px-5 py-2 rounded hover:bg-gray-700"
            disabled={loading}
          >
            {loading ? "Testing..." : "Test Backend Connection"}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-400 mb-4">
            Sentinel Dashboard
          </h1>
          <p className="text-gray-400 mb-4">ESP32: {esp32Url}</p>

          {status ? (
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 max-w-xl mx-auto">
              <p className="text-lg mb-2">
                <span className="font-semibold text-blue-300">Status:</span>{" "}
                {status.status || "Unknown"}
              </p>
              <p className="text-gray-400 mb-2">
                <span className="font-semibold">Last Update:</span>{" "}
                {status.time || "N/A"}
              </p>
              {status.image && (
                <img
                  src={status.image}
                  alt="ESP32 Feed"
                  className="mt-4 rounded-lg border border-gray-700"
                />
              )}
            </div>
          ) : (
            <p className="text-gray-500">Waiting for ESP32 data...</p>
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
