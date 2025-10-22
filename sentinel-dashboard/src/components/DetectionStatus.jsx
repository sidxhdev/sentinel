import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function DetectionStatus({ baseUrl }) {
  const [status, setStatus] = useState("Waiting for device IP...");
  const [lastSeen, setLastSeen] = useState(null);
  const pollingRef = useRef(null);

  // helper: normalized base
  const host = baseUrl
    ? (baseUrl.startsWith("http") ? baseUrl.replace(/\/$/, "") : `http://${baseUrl}`)
    : null;

  // browser notification helper
  const notify = (message) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(message);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") new Notification(message);
      });
    }
  };

  useEffect(() => {
    if (!host) {
      setStatus("Waiting for device IP...");
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    const fetchStatus = async () => {
      try {
        // Try to fetch /status - ensure the ESP32 serves CORS headers if you fetch from a different origin
        const res = await axios.get(`${host}/status`, { timeout: 3000 });
        const data = res.data || {};
        setLastSeen(new Date().toLocaleTimeString());
        if (data.person === "authorized") {
          setStatus("✅ Authorized Person");
        } else if (data.person === "unauthorized" || data.person === "intruder") {
          setStatus("🚨 Intruder Detected!");
          notify("🚨 Intruder detected by Sentinel!");
        } else {
          setStatus("⚙️ Monitoring...");
        }
      } catch (err) {
        // network or CORS issue
        setStatus("⚠️ Unable to reach device (check LAN & CORS)");
      }
    };

    // initial fetch and interval
    fetchStatus();
    pollingRef.current = setInterval(fetchStatus, 5000);
    return () => clearInterval(pollingRef.current);
  }, [host]);

  return (
    <div style={{ marginTop: 16, padding: 18, border: "1px solid #eee", borderRadius: 10, width: 420 }}>
      <h3>Intrusion Detection Status</h3>
      <p style={{ fontSize: 18 }}>{status}</p>
      <p style={{ fontSize: 12, color: "#777" }}>Last checked: {lastSeen || "-"}</p>
      <div style={{ marginTop: 10 }}>
        <small style={{ color: "#555" }}>
          Note: If the dashboard is served from a different origin (Vercel) you will need to enable CORS on the ESP32 or use a backend proxy.
        </small>
      </div>
    </div>
  );
}
