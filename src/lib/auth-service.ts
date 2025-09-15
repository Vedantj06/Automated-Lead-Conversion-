import { ApiClient } from './api-client';

// Types for authentication
export interface User {
  _uid: string;
  _id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface LoginRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

// Authentication service
export class AuthService {
  private static readonly AUTH_ENDPOINT = import.meta.env.VITE_AUTH_ENDPOINT || '/auth';

  /**
   * Send OTP to email for login
   */
  static async sendOTP(email: string): Promise<AuthResponse> {
    try {
      const response = await ApiClient.post<AuthResponse>(
        `${this.AUTH_ENDPOINT}/send-otp`,
        { email }
      );
      return response;
    } catch (error: any) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP. Please try again.',
      };
    }
  }

  /**
   * Verify OTP and complete login
   */
  static async verifyOTP(email: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await ApiClient.post<AuthResponse>(
        `${this.AUTH_ENDPOINT}/verify-otp`,
        { email, otp }
      );

      if (response.success && response.token) {
        // Store auth data in localStorage
        localStorage.setItem('auth_token', response.token);
        if (response.user) {
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid OTP. Please try again.',
      };
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await ApiClient.post(`${this.AUTH_ENDPOINT}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  /**
   * Get current user from localStorage
   */
  static getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Get auth token
   */
  static getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Refresh user session (if backend supports refresh tokens)
   */
  static async refreshSession(): Promise<AuthResponse> {
    try {
      const response = await ApiClient.post<AuthResponse>(
        `${this.AUTH_ENDPOINT}/refresh`
      );

      if (response.success && response.token) {
        localStorage.setItem('auth_token', response.token);
        if (response.user) {
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error: any) {
      console.error('Refresh session error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Session expired. Please login again.',
      };
    }
  }
}

export default AuthService;