let latestAlert = {
  status: "idle",
  image: null,
  time: new Date().toLocaleString(),
};

export function getAlert() {
  return latestAlert;
}

export function setAlert(status, image) {
  latestAlert = {
    status,
    image,
    time: new Date().toLocaleString(),
  };
}
