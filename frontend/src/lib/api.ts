// API service for making HTTP requests to the backend
// Automatically handles authentication tokens and error handling

import { API_END_POINT } from "./apiEndpoints";

// For client-side requests, we need to use the full backend URL
// Next.js rewrites only work for server-side requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  error: boolean;
  data: T;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const url = `${API_BASE_URL}${endpoint}`;

    // Debug: Log the URL being called (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', url);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error responses
        const error: ApiError = {
          message: data.message || data.error || 'An error occurred',
          statusCode: response.status,
          error: data.error,
        };
        throw error;
      }

      return data;
    } catch (error) {
      // Handle network errors or other exceptions
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw {
          message: 'Network error. Please check your connection.',
          statusCode: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const api = new ApiClient();

// Auth API endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    return api.post<ApiResponse<{ access_token: string; user: any }>>(API_END_POINT.LOGIN, {
      email,
      password,
    });
  },

  register: async (data: {
    email: string;
    password: string;
    nickname: string;
    language?: string;
  }) => {
    return api.post<ApiResponse<{ message: string; user: any }>>(API_END_POINT.REGISTER_ACCOUNT, data);
  },

  verifyEmail: async (email: string, otp: string) => {
    return api.post<ApiResponse<{ message: string; user: any }>>(API_END_POINT.VERIFY_EMAIL, {
      email,
      otp,
    });
  },

  resendOtp: async (email: string) => {
    return api.post<ApiResponse<{ message: string }>>(API_END_POINT.RESEND_OTP, { email });
  },

  forgotPassword: async (email: string) => {
    return api.post<ApiResponse<{ message: string }>>(API_END_POINT.FORGOT_PASSWORD, { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return api.post<ApiResponse<{ message: string }>>(API_END_POINT.RESET_PASSWORD, {
      token,
      newPassword,
    });
  },
};

