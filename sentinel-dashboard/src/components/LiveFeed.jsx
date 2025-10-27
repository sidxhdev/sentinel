import { useState } from "react";

export default function LiveFeed() {
  const [error, setError] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔦 THIS IS THE FLASH CONTROL FUNCTION
  const toggleFlash = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/flash?state=${flashOn ? 'off' : 'on'}`);
      if (response.ok) {
        setFlashOn(!flashOn);
      }
    } catch (err) {
      console.error("Failed to toggle flash:", err);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-3 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        
      </div>
      
      {error ? (
        <div className="bg-gray-800 rounded-lg h-[400px] flex flex-col items-center justify-center p-6 text-center">
          <div className="text-6xl mb-4">📡</div>
          <p className="text-red-400 font-semibold mb-2">Unable to connect to AI stream</p>
          <p className="text-gray-400 text-sm mb-4">Make sure Python is running on port 5000</p>
          <button 
            onClick={() => {
              setError(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden bg-gray-800">
          <img
            src="http://localhost:5000/video_feed"
            alt="Live Feed"
            className="w-full h-auto object-contain"
            onError={() => setError(true)}
          />
          <div className="absolute top-2 right-2 bg-black/70 px-3 py-1 rounded-full text-xs text-white">
            🔴 LIVE
          </div>
        </div>
      )}
    </div>
  );
}