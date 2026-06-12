import { api } from "../../../services/api";
import { User } from "../../../types";
import { jwtDecode } from "jwt-decode";
import { ApiResponse } from "../../../types/api.types";

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
    const response = await api.post<ApiResponse<BackendLoginResponse>>(
      "/auth/login",
      { email, password },
    );
    const { access_token } = response.data.data;
    const decoded = jwtDecode<JwtPayload>(access_token);

    const userResponse = await api.get<ApiResponse<User>>(
      `/users/${decoded.sub}`,
      { headers: { Authorization: `Bearer ${access_token}` } },
    );

    return { token: access_token, user: userResponse.data.data };
  },

  register: async (userData: Partial<User>): Promise<AuthResponse> => {
    await api.post<ApiResponse<any>>("/auth/register", userData);
    // El backend retorna solo el User sin token, así que hacemos login automático
    return authService.login(userData.email!, userData.password!);
  },

  getProfile: async (token: string): Promise<User> => {
    const decoded = jwtDecode<JwtPayload>(token);
    const response = await api.get<ApiResponse<User>>(
      `/users/${decoded.sub}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data.data;
  },
};
