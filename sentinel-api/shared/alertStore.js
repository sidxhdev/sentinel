// sentinel-api/shared/alertStore.js

// A simple shared in-memory store
let lastAlert = {
  status: "idle",
  image: null,
  time: null
};

export function setAlert(newData) {
  lastAlert = newData;
}

export function getAlert() {
  return lastAlert;
}
