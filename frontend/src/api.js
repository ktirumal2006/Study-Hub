// frontend/src/api.js
import axios from "axios";

// Hard-coded live API URL if env var is missing
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://5fb269r4b9.execute-api.us-east-1.amazonaws.com/dev";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
