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
  sub: string;
  email: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log("🚀 ~ authService ~ login ~ email:", email);
    const response = await api.post<BackendLoginResponse>("/auth/login", {
      email,
      password,
    });
    const { access_token } = response.data;
    console.log("🚀 ~ authService ~ login ~ access_token received");

    const decoded = jwtDecode<JwtPayload>(access_token);
    const userId = decoded.sub;

    const userResponse = await api.get<User>(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    return {
      token: access_token,
      user: userResponse.data,
    };
  },

  register: async (userData: Partial<User>): Promise<AuthResponse> => {
    const response = await api.post<any>("/auth/register", userData);

    if (response.data.access_token) {
      const { access_token } = response.data;
      const decoded = jwtDecode<JwtPayload>(access_token);
      const userResponse = await api.get<User>(`/users/${decoded.sub}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      return { token: access_token, user: userResponse.data };
    }

    return { token: "", user: response.data };
  },
};
