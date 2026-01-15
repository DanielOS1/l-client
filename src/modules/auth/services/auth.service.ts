import { api } from "../../../services/api";
import { User } from "../../../types";
import { jwtDecode } from "jwt-decode";

interface AuthResponse {
  token: string;
  user: User;
}

interface BackendLoginResponse {
  access_token: string;
}

interface JwtPayload {
  sub: string; // userId
  email: string;
  // other claims
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log("🚀 ~ authService ~ login ~ email:", email);
    // 1. Login to get token
    const response = await api.post<BackendLoginResponse>("/auth/login", {
      email,
      password,
    });
    const { access_token } = response.data;
    console.log("🚀 ~ authService ~ login ~ access_token received");

    // 2. Decode token to get User ID (sub)
    const decoded = jwtDecode<JwtPayload>(access_token);
    const userId = decoded.sub;

    // 3. Fetch User Profile
    // We assume the token is needed for this request, so we manually attach it or use api interceptor if already set?
    // Interceptor reads from SecureStore, but we haven't stored it yet.
    // So we pass it in headers manually for this call.
    const userResponse = await api.get<User>(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    return {
      token: access_token,
      user: userResponse.data,
    };
  },

  register: async (userData: Partial<User>): Promise<AuthResponse> => {
    // Register flow might be similar if it returns token.
    // If backend register returns created user but NO token, we might need to auto-login.
    // Assuming backend register returns same structure or just user.
    // Let's stick to simple register for now, usually it returns the user.
    const response = await api.post<any>("/auth/register", userData);

    // If registration returns a token, we process it. If not, user has to login.
    // Adjust based on actual backend response. For now assuming it auto-logins or we redirect.
    if (response.data.access_token) {
      // reuse login logic or similar
      const { access_token } = response.data;
      const decoded = jwtDecode<JwtPayload>(access_token);
      const userResponse = await api.get<User>(`/users/${decoded.sub}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      return { token: access_token, user: userResponse.data };
    }

    // Fallback if no token returned
    return { token: "", user: response.data };
  },
};
