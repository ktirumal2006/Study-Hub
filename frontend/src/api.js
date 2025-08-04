// frontend/src/api.js
import axios from "axios";

// Use the VITE_API_BASE_URL env var if defined, otherwise default to localhost
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/dev";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
