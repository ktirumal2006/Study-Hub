// src/api.js
import axios from "axios";

const BASE_URL = "http://localhost:3000/dev";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
