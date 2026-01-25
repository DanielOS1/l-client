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
    console.log("🚀 ~ authService ~ login ~ email:", email);
    const response = await api.post<ApiResponse<BackendLoginResponse>>(
      "/auth/login",
      {
        email,
        password,
      },
    );
    // Now AccessToken is in response.data.data.access_token
    const { access_token } = response.data.data;
    console.log("🚀 ~ authService ~ login ~ access_token received");

    const decoded = jwtDecode<JwtPayload>(access_token);
    const userId = decoded.sub;

    const userResponse = await api.get<ApiResponse<User>>(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    return {
      token: access_token,
      user: userResponse.data.data,
    };
  },

  register: async (userData: Partial<User>): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<any>>(
      "/auth/register",
      userData,
    );

    // Register might return the user or an access token depending on backend.
    // Assuming backend returns just object, but based on code below it expects access_token?
    // The previous code was: if (response.data.access_token)
    // Now it is: if (response.data.data.access_token)

    const responseData = response.data.data;

    if (responseData.access_token) {
      const { access_token } = responseData;
      const decoded = jwtDecode<JwtPayload>(access_token);
      const userResponse = await api.get<ApiResponse<User>>(
        `/users/${decoded.sub}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );
      return { token: access_token, user: userResponse.data.data };
    }

    return { token: "", user: responseData };
  },
};
