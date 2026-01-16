// Authentication utilities for route protection

export interface User {
  id: string;
  email: string;
  nickname: string;
  language?: string;
  role?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Get token from localStorage
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Get user from localStorage
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Set authentication data
export function setAuth(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}

// Clear authentication data
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
}

// Login function - calls real backend API
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const { authApi } = await import('./api');
  
  try {
    const response = await authApi.login(email, password);
    
    // Backend returns wrapped response: { statusCode, message, error, data: { access_token, user } }
    // Store token and user in localStorage (persists after refresh)
    setAuth(response.data.access_token, response.data.user);
    
    return {
      token: response.data.access_token,
      user: response.data.user,
    };
  } catch (error: any) {
    // Re-throw with a more user-friendly message
    const errorMessage = error?.message || 'Login failed. Please check your credentials.';
    throw new Error(errorMessage);
  }
}

// Logout function
export function logout(): void {
  clearAuth();
}

// Register function - calls real backend API
export async function register(data: {
  email: string;
  password: string;
  nickname: string;
  language?: string;
}): Promise<{ message: string; user: any }> {
  const { authApi } = await import('./api');
  
  try {
    const response = await authApi.register(data);
    return {
      message: response.message,
      user: response.data.user,
    };
  } catch (error: any) {
    const errorMessage = error?.message || 'Registration failed. Please try again.';
    throw new Error(errorMessage);
  }
}

