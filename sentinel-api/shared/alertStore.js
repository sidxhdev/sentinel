// shared/alertStore.js

// Simple in-memory alert store for prototype use
let latestAlert = {
  status: "idle",
  image: null,
  time: null,
};

// Save alert data (used in /api/alert)
export function setAlert(status, image) {
  latestAlert = {
    status,
    image,
    time: new Date().toLocaleString(),
  };
  console.log("🔔 Alert updated:", latestAlert);
}

// Get latest alert (used in /api/status)
export function getAlert() {
  return latestAlert;
}
