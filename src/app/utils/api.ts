const DEFAULT_API_BASE_URL = "https://backend-r6dd.onrender.com";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
const normalizedBaseUrl = rawBaseUrl
  ? rawBaseUrl.replace(/\/$/, "")
  : DEFAULT_API_BASE_URL;

export const API_BASE_URL = normalizedBaseUrl;
