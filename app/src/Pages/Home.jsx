import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Box,
  useTheme,
  alpha,
  useMediaQuery,
  Tooltip,
  Badge,
  InputBase,
  styled,
  Stack,
  Container,
} from "@mui/material";
import { motion } from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FileManager from "./FileManager";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";

// Current user & date information
const CURRENT_USER = "ManojGowda89";
const CURRENT_DATE = "2025-08-13 04:41:27";

// Styled components
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: alpha(theme.palette.common.white, 0.08),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.12),
  },
  transition: theme.transitions.create('background'),
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(theme.palette.common.white, 0.5),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const Home = ({ isLoggedIn, onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  // States for navigation and UI
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentCategory, setCurrentCategory] = useState("images");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  
  // Handle drawer for mobile/desktop
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  // Nav handlers
  const handleDrawerToggle = () => {
    setDrawerOpen(prev => !prev);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    onLogout();
    handleMenuClose();
  };

  const menuOpen = Boolean(anchorEl);

  // Categories for the drawer
  const categories = [
    { id: "images", label: "Images", icon: <ImageIcon /> },
    { id: "videos", label: "Videos", icon: <VideoLibraryIcon /> },
    { id: "audio", label: "Audio", icon: <AudiotrackIcon /> },
    { id: "documents", label: "Documents", icon: <DescriptionIcon /> },
  ];

  // Drawer content
  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        py: 2,
        background: 'linear-gradient(90deg, #121212 0%, #1a237e 100%)',
      }}>
        <Avatar 
          sx={{ 
            width: 40, 
            height: 40, 
            bgcolor: theme.palette.primary.main,
            boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`,
            mr: 1.5
          }}
        >
          <Box component="span" role="img" aria-label="media">📁</Box>
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Media Manager
        </Typography>
      </Box>
      
      <Divider />
      
      <Box sx={{ pt: 2 }}>
        <Typography variant="subtitle2" sx={{ px: 3, mb: 1, color: 'text.secondary' }}>
          CATEGORIES
        </Typography>
        <List>
          {categories.map((category) => (
            <ListItem
              button
              key={category.id}
              selected={currentCategory === category.id}
              onClick={() => {
                setCurrentCategory(category.id);
                if (isMobile) setDrawerOpen(false);
              }}
              sx={{
                my: 0.5,
                mx: 1,
                borderRadius: 1.5,
                bgcolor:
                  currentCategory === category.id
                    ? alpha(theme.palette.primary.main, 0.15)
                    : "transparent",
                color:
                  currentCategory === category.id
                    ? theme.palette.primary.main
                    : "inherit",
                '&:hover': {
                  bgcolor:
                    currentCategory === category.id
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.common.white, 0.05),
                },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    currentCategory === category.id
                      ? theme.palette.primary.main
                      : "inherit",
                  minWidth: 40,
                }}
              >
                {category.icon}
              </ListItemIcon>
              <ListItemText 
                primary={category.label} 
                primaryTypographyProps={{
                  fontWeight: currentCategory === category.id ? 600 : 400,
                }}
              />
              {currentCategory === category.id && (
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    boxShadow: `0 0 5px ${theme.palette.primary.main}`,
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Divider sx={{ mt: 2, mb: 2 }} />
      
      <List>
        {/* <ListItem button>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem> */}
        
        <ListItem button onClick={handleLogoutClick}>
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <CloseIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ color: theme.palette.error.main }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backdropFilter: 'blur(8px)',
          bgcolor: 'transparent',
          backgroundImage: 'linear-gradient(145deg, rgba(20, 21, 33, 0.9) 0%, rgba(25, 28, 49, 0.9) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              display: { xs: 'none', sm: 'block' },
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196f3, #6ec6ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Media Manager
          </Typography>

          <Box sx={{ flexGrow: 1 }} />
          
       
        
        </Toolbar>
      </AppBar>

      {/* Account Menu */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 2,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            minWidth: 180,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: theme.palette.background.paper,
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
       
  
        
        <Divider />
        
        <MenuItem onClick={handleLogoutClick} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <CloseIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: 250,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 250,
            border: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pl: { sm: 0, md: drawerOpen ? '250px' : 0 },
          transition: theme.transitions.create(['padding'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <FileManager 
          currentCategory={currentCategory}
          searchQuery={searchQuery}
        />
        
       
      </Box>
    </Box>
  );
};

export default Home;