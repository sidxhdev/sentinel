import { useState } from "react";
import LiveFeed from "./components/LiveFeed";
import FaceStats from "./components/FaceStats";
import IntrusionAlert from "./components/IntrusionAlert";

export default function App() {
  const [esp32Url, setEsp32Url] = useState(localStorage.getItem("esp32Url") || "");
  const [connected, setConnected] = useState(!!esp32Url);

  const [faceCount, setFaceCount] = useState(0);
  const [people, setPeople] = useState([]);
  const [intrusion, setIntrusion] = useState(false);

  const handleConnect = () => {
    if (!esp32Url.trim()) return alert("Enter ESP32-CAM URL");
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
          <p className="text-gray-400 mb-8">Enter your ESP32-CAM IP address:</p>
          <input
            type="text"
            value={esp32Url}
            onChange={(e) => setEsp32Url(e.target.value)}
            placeholder="e.g. http://192.168.1.50"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          <div className="lg:col-span-2">
            <LiveFeed esp32Url={esp32Url} />
          </div>
          <div className="flex flex-col gap-6">
            <FaceStats faceCount={faceCount} people={people} />
            <IntrusionAlert intrusion={intrusion} />
          </div>
          <div className="lg:col-span-3 flex justify-center mt-4">
            <button
              onClick={handleDisconnect}
              className="bg-red-600 px-5 py-2 rounded hover:bg-red-700"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
