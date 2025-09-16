import ApiClient from "./api-client";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

class AuthService {
  private AUTH_ENDPOINT = "/auth";

  async login(email: string, otp: string): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>(
      `${this.AUTH_ENDPOINT}/login`,
      { email, otp }
    );
    const data = response.data;

    if (data.success && data.token) {
      localStorage.setItem("auth_token", data.token);
      if (data.user) {
        localStorage.setItem("user_data", JSON.stringify(data.user));
      }
    }

    return data;
  }

  async verifyToken(): Promise<AuthResponse> {
    const response = await ApiClient.get<AuthResponse>(
      `${this.AUTH_ENDPOINT}/verify`
    );
    return response.data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  }
}

export const AuthServiceInstance = new AuthService();
export { AuthService };
export default AuthServiceInstance;
