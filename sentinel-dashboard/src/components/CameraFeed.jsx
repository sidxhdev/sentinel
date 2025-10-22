import React from "react";

export default function CameraFeed({ baseUrl }) {
  // Accept baseUrl like "http://192.168.1.100" or "192.168.1.100"
  if (!baseUrl) {
    return (
      <div style={{ textAlign: "center", width: 420 }}>
        <h2>📸 Live Camera Feed</h2>
        <div style={{ padding: 20, border: "1px dashed #ccc", borderRadius: 8 }}>
          <p style={{ color: "#666" }}>Enter ESP32 IP above to show the live feed.</p>
        </div>
      </div>
    );
  }

  const host = baseUrl.startsWith("http") ? baseUrl.replace(/\/$/, "") : `http://${baseUrl}`;
  // stream endpoint could be /stream, /, or /camera; adjust to your ESP32 code
  const streamUrl = `${host}/stream`;

  return (
    <div style={{ textAlign: "center", width: 420 }}>
      <h2>📸 Live Camera Feed</h2>
      <div style={{ borderRadius: 12, overflow: "hidden", display: "inline-block", boxShadow: "0 4px 18px rgba(0,0,0,0.08)" }}>
        <img
          src={streamUrl}
          alt="ESP32-CAM Stream"
          style={{ display: "block", width: 420, height: "auto", background: "#000" }}
          onError={(e) => {
            // show friendly message in case of error
            e.target.onerror = null;
            e.target.src = "";
          }}
        />
      </div>
      <p style={{ fontSize: 13, color: "#666", marginTop: 8 }}>{streamUrl}</p>
    </div>
  );
}
