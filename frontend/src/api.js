import axios from "axios";

// Hard-coded live API URL if env var is missing
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://qnykagx0a7.execute-api.us-east-1.amazonaws.com/prod";

// Check what we’re actually using
console.log("🔗 API base URL:", BASE_URL);

export const api = axios.create({ baseURL: BASE_URL, headers: { "Content-Type": "application/json" } });
