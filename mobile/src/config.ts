const fallbackBaseUrl = "http://127.0.0.1:3000";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || fallbackBaseUrl;

