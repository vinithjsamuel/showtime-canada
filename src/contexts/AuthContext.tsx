import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, LoginCredentials, RegisterData, User } from '../types/user';
import { toast } from 'react-toastify';
import { openDB } from 'idb';

// Database setup
const DB_NAME = 'cinema-tickets-db';
const DB_VERSION = 2; // Updated to match ticketStorage version

const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create users store if it doesn't exist
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('email', 'email', { unique: true });
      }
      
      // Create tickets store if it doesn't exist (for compatibility with ticketStorage)
      if (!db.objectStoreNames.contains('tickets')) {
        const ticketStore = db.createObjectStore('tickets', { keyPath: 'id' });
        ticketStore.createIndex('userId', 'userId', { unique: false });
        ticketStore.createIndex('bookingId', 'bookingId', { unique: true });
        ticketStore.createIndex('eventId', 'eventId', { unique: false });
        ticketStore.createIndex('status', 'status', { unique: false });
      }
    },
  });
  
  // Add test user if no users exist
  const count = await db.count('users');
  if (count === 0) {
    await db.add('users', {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      location: 'Toronto',
      preferences: {
        favoriteGenres: ['Action', 'Comedy']
      }
    });
  }
  
  return db;
};

// Initial state for the auth context
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null
};

// Action types for the reducer
type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_REQUEST' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: User }
  | { type: 'RESET_PASSWORD_REQUEST' }
  | { type: 'RESET_PASSWORD_SUCCESS' }
  | { type: 'RESET_PASSWORD_FAILURE'; payload: string };

// Reducer function to handle auth state changes
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
    case 'RESET_PASSWORD_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'UPDATE_PROFILE':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
    case 'RESET_PASSWORD_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'RESET_PASSWORD_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null
      };
    case 'LOGOUT':
      return {
        ...initialState
      };
    default:
      return state;
  }
};

// Create the auth context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component for the auth context
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    
    // Initialize the database
    initDB();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      const db = await openDB(DB_NAME, DB_VERSION);
      
      // Get all users and find matching email
      const users = await db.getAll('users');
      const user = users.find(user => 
        user.email === credentials.email && user.password === credentials.password
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Create a user object without the password
      const authenticatedUser: User = {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        location: user.location,
        preferences: user.preferences
      };

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(authenticatedUser));

      dispatch({ type: 'LOGIN_SUCCESS', payload: authenticatedUser });
      toast.success('Login successful!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'REGISTER_REQUEST' });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const db = await openDB(DB_NAME, DB_VERSION);
      
      // Check if email already exists
      const index = db.transaction('users').store.index('email');
      const existingUser = await index.get(data.email);
      
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Create new user with default preferences
      const newUserData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        location: data.location,
        preferences: {
          favoriteGenres: []
        }
      };
      
      // Add user to database
      const userId = await db.add('users', newUserData);
      
      // Create user object for state (without password)
      const newUser: User = {
        id: userId.toString(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        location: data.location,
        preferences: newUserData.preferences
      };

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(newUser));

      dispatch({ type: 'REGISTER_SUCCESS', payload: newUser });
      toast.success('Registration successful!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    toast.info('Logged out successfully');
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    dispatch({ type: 'RESET_PASSWORD_REQUEST' });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, "activate" is the special code that works
      if (email.toLowerCase() !== 'activate') {
        const db = await openDB(DB_NAME, DB_VERSION);
        const index = db.transaction('users').store.index('email');
        const existingUser = await index.get(email);
        
        if (!existingUser) {
          throw new Error('Email not found');
        }
      }

      dispatch({ type: 'RESET_PASSWORD_SUCCESS' });
      toast.success('Verification code sent to your email');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      dispatch({ type: 'RESET_PASSWORD_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Update profile function
  const updateProfile = async (userData: User): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const db = await openDB(DB_NAME, DB_VERSION);
      
      // Get user from database
      const user = await db.get('users', Number(userData.id));
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update user data
      const updatedUser = {
        ...user,
        firstName: userData.firstName,
        lastName: userData.lastName,
        location: userData.location,
        preferences: userData.preferences
      };
      
      // Put updated user back in database
      await db.put('users', updatedUser);

      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      dispatch({ type: 'UPDATE_PROFILE', payload: userData });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 