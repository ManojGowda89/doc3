import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  Avatar,
  InputAdornment,
  IconButton,
  Alert,
  useTheme,
  alpha,
  CircularProgress
} from "@mui/material";
import { motion } from "framer-motion";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";

const Login = ({ onLogin }) => {
  const theme = useTheme();

  // ✅ Multiple credentials
  const credentials = [
    { email: "mail@manojgowda.in", password: "Manoj@2002" },
    { email: "admin@example.com", password: "admin123" },
    { email: "akriti@mail.skoegle.com", password: "Skoegle@2025" },
    { email: "sanjay@mail.skoegle.com", password: "Skoegle@2025" }
  ];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (error) setError("");
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    // ✅ Check against all credentials
    const match = credentials.find(
      (cred) => cred.email === email && cred.password === password
    );

    if (match) {
      setLoginSuccess(true);
      sessionStorage.setItem("isLoggedIn", "true");

      setTimeout(() => {
        onLogin(true);
      }, 1000);
    } else {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundImage: "linear-gradient(135deg, #121212 0%, #0a1929 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background animation */}
      <Box
        sx={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            component={motion.div}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0.1 + Math.random() * 0.2
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            sx={{
              position: "absolute",
              width: 100 + Math.random() * 200,
              height: 100 + Math.random() * 200,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, rgba(0,0,0,0) 70%)`,
              filter: "blur(40px)",
            }}
          />
        ))}
      </Box>

      <Container component="main" maxWidth="xs" sx={{ zIndex: 1, py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(30, 30, 30, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
            }}
          >
            {loginSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Avatar
                  sx={{
                    m: 1,
                    bgcolor: "success.main",
                    width: 60,
                    height: 60
                  }}
                >
                  <Box component="span" role="img" aria-label="check" sx={{ fontSize: 30 }}>
                    ✓
                  </Box>
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
                  Login Successful!
                </Typography>
              </motion.div>
            ) : (
              <>
                <Avatar
                  sx={{
                    m: 1,
                    bgcolor: theme.palette.primary.main,
                    width: 56,
                    height: 56,
                    boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`
                  }}
                >
                  <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  Media Manager
                </Typography>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ width: '100%', marginBottom: 16 }}
                  >
                    <Alert severity="error" variant="filled">{error}</Alert>
                  </motion.div>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      sx: {
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.common.white, 0.05)
                      }
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.common.white, 0.05)
                      }
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.2,
                      background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.2)}, transparent)`,
                        transition: 'all 0.5s',
                      },
                      '&:hover::after': {
                        left: '100%',
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Box>
              </>
            )}
          </Paper>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Media Manager. All rights reserved.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
