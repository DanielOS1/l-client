import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

import { API_URL as ENV_API_URL } from "@env";

/**
 * Dynamically determines the API URL.
 * - Uses .env file if available (PRIMARY).
 * - Fallback to Expo constants or localhost for convenience.
 */
const getApiUrl = () => {
  // 1. Prefer .env configuration
  if (ENV_API_URL) {
    return ENV_API_URL;
  }

  // 2. In Expo Go/Dev Client, we can get the host IP from the manifest
  const debuggerHost = Constants.expoConfig?.hostUri; // e.g. "192.168.1.10:8081"
  const localhost = "http://10.0.2.2:3000"; // Android Emulator loopback IP

  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    return `http://${ip}:3000`;
  }

  // 3. Fallback to localhost
  console.warn(
    "⚠️ No API_URL in .env and no dynamic IP detected. Using fallback (10.0.2.2).",
  );
  return localhost;
};

export const API_URL = getApiUrl();
console.log("🔗 API_URL Configured:", API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: Handle 401 Unauthorized globally (e.g. logout)
    return Promise.reject(error);
  },
);
