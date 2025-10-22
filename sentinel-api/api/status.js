import { lastAlert } from "./alert.js";

export default function handler(req, res) {
  res.status(200).json(lastAlert);
}
