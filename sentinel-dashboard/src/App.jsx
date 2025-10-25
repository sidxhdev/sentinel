import { useState, useEffect } from "react";

export default function App() {
  const [esp32Url, setEsp32Url] = useState(localStorage.getItem("esp32Url") || "");
  const [connected, setConnected] = useState(!!esp32Url);

  const handleConnect = () => {
    if (!esp32Url.trim()) {
      alert("Please enter ESP32-CAM IP address");
      return;
    }
    localStorage.setItem("esp32Url", esp32Url.trim());
    setConnected(true);
  };

  const handleDisconnect = () => {
    localStorage.removeItem("esp32Url");
    setConnected(false);
    setEsp32Url("");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      {!connected ? (
        <div className="text-center">
          <h1 className="text-5xl font-bold text-blue-400 mb-6">Welcome to Sentinel</h1>
          <p className="text-gray-400 mb-8">Enter your ESP32-CAM IP to view live feed.</p>

          <input
            type="text"
            placeholder="e.g. http://192.168.29.57"
            value={esp32Url}
            onChange={(e) => setEsp32Url(e.target.value)}
            className="px-4 py-2 w-80 rounded bg-gray-900 text-gray-200 border border-gray-700 focus:outline-none"
          />

          <button
            onClick={handleConnect}
            className="ml-3 bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
          >
            Connect
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          <h1 className="text-4xl font-bold text-blue-400 mb-4">Sentinel Dashboard</h1>
          <p className="text-gray-500 mb-4">Connected to: {esp32Url}</p>

          <div className="w-full max-w-3xl border border-gray-800 rounded-2xl overflow-hidden">
            {/* Live MJPEG stream */}
            <img
              src={`${esp32Url}/stream`}
              alt="ESP32-CAM Live Stream"
              className="w-full"
              onError={() => alert("⚠️ Unable to load stream. Check IP or network.")}
            />
          </div>

          <button
            onClick={handleDisconnect}
            className="mt-6 bg-red-600 px-5 py-2 rounded hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
