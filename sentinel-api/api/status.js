import { getAlert } from "../shared/alertStore.js";

export default async function handler(req, res) {
  const data = getAlert();
  res.status(200).json(data);
}
