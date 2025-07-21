import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Components
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Profile from './components/profile/Profile';

// Pages
import HomePage from './pages/HomePage';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import Events from './pages/Events';
import EventCategories from './pages/EventCategories';
import EventDetail from './pages/EventDetail';
import CheckoutReview from './pages/CheckoutReview';
import PaymentMethods from './pages/PaymentMethods';
import BookingConfirmation from './pages/BookingConfirmation';

// Auth Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Theme customization
const theme = createTheme({
  palette: {
    primary: {
      main: '#6a5acd',
    },
    secondary: {
      main: '#e0daf7',
    },
    background: {
      default: '#f7f7f7',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<HomePage />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="movies" element={<Movies />} />
              <Route path="movies/:id" element={<MovieDetail />} />
              <Route path="events" element={<Events />} />
              <Route path="events/categories" element={<EventCategories />} />
              <Route path="events/category/:categoryId" element={<Events />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="checkout/review/:id" element={<CheckoutReview />} />
              <Route path="checkout/payment/:id" element={<PaymentMethods />} />
              <Route path="booking/confirmation/:id" element={<BookingConfirmation />} />

              {/* Protected Routes */}
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
