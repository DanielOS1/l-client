import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

/**
 * Dynamically determines the API URL.
 * - In production/standalone: Uses the defined prod URL.
 * - In development: Tries to use the IP of the machine running Expo (Metro).
 */
const getApiUrl = () => {
  // 1. If we have a hardcoded production URL, return it (uncomment for prod/staging)
  // return 'https://api.lolosapp.com';

  // 2. In Expo Go/Dev Client, we can get the host IP from the manifest
  const debuggerHost = Constants.expoConfig?.hostUri; // e.g. "192.168.1.10:8081"
  const localhost = "http://10.0.2.2:3000"; // Android Emulator loopback IP

  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    return `http://${ip}:3000`;
  }

  // 3. Fallback to localhost (Android Emulator needs 10.0.2.2 usually, but dynamic IP is better)
  // If running on web or unknown:
  console.warn(
    "⚠️ No se pudo detectar la IP dinámica. Usando fallback para Emulador Android (10.0.2.2)."
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
  }
);
