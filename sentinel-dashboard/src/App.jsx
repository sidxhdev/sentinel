import React from "react";
import CameraFeed from "./components/CameraFeed";
import DetectionStatus from "./components/DetectionStatus";

function App() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", textAlign: "center", padding: "30px" }}>
      <h1>🛡️ Sentinel – Smart Intrusion Detection</h1>
      <CameraFeed />
      <DetectionStatus />
      <footer style={{ marginTop: "40px", fontSize: "14px", color: "#666" }}>
        Made with ❤️ using React & ESP32-CAM
      </footer>
    </div>
  );
}

export default App;
