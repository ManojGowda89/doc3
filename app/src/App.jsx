import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box, CircularProgress } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import Home from "../src/Pages/Home";
import Login from "../src/Pages/Login";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create black and blue theme
  const theme = useMemo(() => 
    createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: '#2196f3', // Blue
          light: '#64b5f6',
          dark: '#0d47a1',
        },
        secondary: {
          main: '#f50057', // Pink accent
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
          darker: '#0a0a0a',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b0b0b0',
        },
      },
      typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
          fontWeight: 600,
          letterSpacing: '0.02em',
        },
        h6: {
          fontWeight: 500,
        },
        button: {
          textTransform: 'none',
          fontWeight: 500,
        }
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              background: 'linear-gradient(90deg, #121212 0%, #1e1e1e 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease-in-out',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundImage: 'linear-gradient(145deg, rgba(30,30,30,1) 0%, rgba(20,20,20,1) 100%)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'linear-gradient(145deg, rgba(30,30,30,0.7) 0%, rgba(25,25,25,0.8) 100%)',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              background: 'linear-gradient(180deg, #121212 0%, #1a1a1a 100%)',
              borderRight: '1px solid rgba(255,255,255,0.05)',
            },
          },
        },
      },
    }), []
  );

  useEffect(() => {
    // Simulate loading and auth check
    const checkAuth = async () => {
      setLoading(true);
      // Check session storage for login status
      const loggedIn = sessionStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
      
      // Artificial delay to show loading animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = (status) => {
    setIsLoggedIn(status);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

 if (loading) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #121212 0%, #0d47a1 100%)',
        }}
      >
        <CircularProgress
          size={80}
          thickness={4}
          sx={{
            color: theme.palette.primary.main,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }}
        />
      </Box>
    </ThemeProvider>
  );
}
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              isLoggedIn ? 
                <Home isLoggedIn={isLoggedIn} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/login" 
            element={
              !isLoggedIn ? 
                <Login onLogin={handleLogin} /> : 
                <Navigate to="/" />
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;