// Authentication utilities for route protection

export interface User {
  id: string;
  email: string;
  nickname: string;
  language?: string;
  role?: string;
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

// Login function (dummy for now, can be connected to backend)
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  // This is a dummy implementation
  // In production, you would call your backend API: /api/auth/login
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    setAuth(data.access_token, data.user);
    return { token: data.access_token, user: data.user };
  } catch (error) {
    // For development/dummy purposes, create a mock user
    const mockUser: User = {
      id: '1',
      email,
      nickname: email.split('@')[0],
      role: 'user',
    };
    const mockToken = 'dummy_token_' + Date.now();
    setAuth(mockToken, mockUser);
    return { token: mockToken, user: mockUser };
  }
}

// Logout function
export function logout(): void {
  clearAuth();
}

