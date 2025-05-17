export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  favoriteGenres: string[];
  notificationEnabled: boolean;
  language: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
} 