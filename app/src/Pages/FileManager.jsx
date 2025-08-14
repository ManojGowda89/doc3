import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Alert,
  Paper,
  Box,
  Tooltip,
  Fade,
  Chip,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Typography,
  Button,
  alpha,
  IconButton,
  Skeleton,
  ButtonGroup,
  Menu,
  MenuItem,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  useMediaQuery
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import LinkIcon from "@mui/icons-material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import DescriptionIcon from "@mui/icons-material/Description";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StorageIcon from "@mui/icons-material/Storage";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FolderIcon from "@mui/icons-material/Folder";
import axios from "axios";

// Current date and user information
const CURRENT_DATE = "2025-08-13 04:51:34";
const CURRENT_USER = "ManojGowda89";

const API_URL = "/api"; // Base API URL

const acceptTypes = {
  images: "image/*",
  videos: "video/*",
  audio: "audio/*",
  documents: "*/*", // accept any file type
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};

const FileManager = ({ currentCategory, searchQuery }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  // States for UI
  const [viewMode, setViewMode] = useState("list");
  
  // States for file management
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // States for filtering and sorting
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterSize, setFilterSize] = useState("all");
  
  // For duplicate file handling
  const [duplicateDialog, setDuplicateDialog] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentBase64, setCurrentBase64] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [fileDetailsDialog, setFileDetailsDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const fileInputRef = useRef(null);
  
  const sortMenuOpen = Boolean(sortAnchorEl);
  const filterMenuOpen = Boolean(filterAnchorEl);

  // Convert file to Base64 (without data: prefix)
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });

  // Fetch all files of the current type from API
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/all/${currentCategory}`);
      
      // Enhance file objects with additional metadata
      const enhancedFiles = response.data.map(file => ({
        ...file,
        size: file.size || 0,
        mimetype: getMimetypeFromFilename(file.name),
        lastModified: file.lastModified || CURRENT_DATE,
        favorite: false, // We'll manage favorites client-side for this demo
        uploadedBy: CURRENT_USER
      }));
      
      setFiles(enhancedFiles);
    } catch (err) {
      console.error("Fetch files error:", err);
      setFiles([]);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || "Failed to load files", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  }, [currentCategory]);
  
  // Get mimetype from filename extension
  const getMimetypeFromFilename = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeMap = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
      bmp: 'image/bmp',
      mp4: 'video/mp4',
      mpeg: 'video/mpeg',
      ogg: 'video/ogg',
      webm: 'video/webm',
      mov: 'video/quicktime',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      aac: 'audio/aac',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain',
      rtf: 'application/rtf'
    };
    
    return mimeMap[ext] || 'application/octet-stream';
  };
  
  // Filter and sort files when data changes
  useEffect(() => {
    // Apply search, filter, and sort
    let result = [...files];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(file => 
        file.name.toLowerCase().includes(query)
      );
    }
    
    // Apply size filter (client-side only since we don't have reliable size info from API)
    if (filterSize !== 'all' && result.some(file => file.size)) {
      result = result.filter(file => {
        const size = file.size || 0;
        switch(filterSize) {
          case 'small': return size < 1024 * 1024; // < 1MB
          case 'medium': return size >= 1024 * 1024 && size < 10 * 1024 * 1024; // 1MB - 10MB
          case 'large': return size >= 10 * 1024 * 1024; // > 10MB
          default: return true;
        }
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch(sortOrder) {
        case 'newest':
          return new Date(b.lastModified || 0) - new Date(a.lastModified || 0);
        case 'oldest':
          return new Date(a.lastModified || 0) - new Date(b.lastModified || 0);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'size-asc':
          return (a.size || 0) - (b.size || 0);
        case 'size-desc':
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });
    
    setFilteredFiles(result);
  }, [files, searchQuery, sortOrder, filterSize]);

  useEffect(() => {
    fetchFiles();
  }, [currentCategory, fetchFiles]);

  // Refresh files with animation
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFiles();
    
    // Keep refresh animation a minimum time for UX
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  // Upload file with the given name and base64 data
  const uploadFile = async (fileName, base64Data, fileType) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to the server
      const response = await axios.post(
        `${API_URL}/upload`,
        {
          type: currentCategory,
          name: fileName,
          base64: base64Data,
          mimetype: fileType,
        },
        {
          onUploadProgress: (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded * 100) / event.total);
              setUploadProgress(percent);
            }
          },
        }
      );
      
      setSnackbar({ open: true, message: "File uploaded successfully", severity: "success" });
      await fetchFiles(); // Refresh the file list
      return true;
    } catch (err) {
      console.error("Upload error:", err);
      
      // Check for duplicate file error
      if (err.response?.status === 409) {
        return false; // Indicate duplicate error
      }
      
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || "Upload failed", 
        severity: "error" 
      });
      return false;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      const base64 = await toBase64(file);
      
      // Try uploading the file
      const success = await uploadFile(file.name, base64, file.type);
      
      // If upload failed due to duplicate, show dialog
      if (!success) {
        // Check if the error is due to duplicate file
        const isDuplicate = files.some(existingFile => 
          existingFile.name.toLowerCase() === file.name.toLowerCase()
        );
        
        if (isDuplicate) {
          // Store current file data for dialog actions
          setCurrentFile(file);
          setCurrentBase64(base64);
          setNewFileName(getFileNameWithSuffix(file.name));
          setDuplicateDialog(true);
        }
      }
    } catch (err) {
      console.error("File processing error:", err);
      setSnackbar({ open: true, message: "Failed to process file", severity: "error" });
    }
  };

  // Generate a new filename with suffix for duplicates
  const getFileNameWithSuffix = (filename) => {
    const nameParts = filename.split('.');
    const extension = nameParts.pop();
    const baseName = nameParts.join('.');
    const timestamp = new Date().getTime().toString().slice(-4);
    return `${baseName}_${timestamp}.${extension}`;
  };

  // Handle duplicate file resolution - rename option
  const handleRenameFile = async () => {
    if (!currentFile || !currentBase64 || !newFileName) return;
    
    const success = await uploadFile(newFileName, currentBase64, currentFile.type);
    if (success) {
      setDuplicateDialog(false);
      setCurrentFile(null);
      setCurrentBase64(null);
      setNewFileName("");
    }
  };

  // Handle duplicate file resolution - replace option
  const handleReplaceFile = async () => {
    if (!currentFile || !currentBase64) return;
    
    try {
      // First delete the existing file
      await axios.delete(`${API_URL}/${currentCategory}/${currentFile.name}`);
      
      // Then upload the new one
      const success = await uploadFile(currentFile.name, currentBase64, currentFile.type);
      if (success) {
        setDuplicateDialog(false);
        setCurrentFile(null);
        setCurrentBase64(null);
        setNewFileName("");
      }
    } catch (err) {
      console.error("Replace file error:", err);
      setSnackbar({ open: true, message: "Failed to replace file", severity: "error" });
    }
  };

  // Download file helper
  const downloadFile = (file) => {
    console.log("file", file);
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbar({ open: true, message: "File download started", severity: "info" });
  };

  // Confirm delete dialog
  const confirmDelete = (file) => {
    setFileToDelete(file);
    setDeleteConfirmDialog(true);
  };

  // Delete single file
  const deleteFile = async () => {
    if (!fileToDelete) return;
    
    try {
      await axios.delete(`${API_URL}/${currentCategory}/${fileToDelete.name}`);
      await fetchFiles(); // Refresh the file list
      setSnackbar({ open: true, message: "File deleted successfully", severity: "info" });
    } catch (err) {
      console.error("Delete file error:", err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || "Delete failed", 
        severity: "error" 
      });
    } finally {
      setDeleteConfirmDialog(false);
      setFileToDelete(null);
    }
  };

  // Show file details dialog
  const showFileDetails = (file) => {
    setSelectedFile(file);
    setFileDetailsDialog(true);
  };

  // Copy URL to clipboard
  const copyUrlToClipboard = async (url) => {
    console.log("Copying URL to clipboard:", url);
    try {
      await navigator.clipboard.writeText(url);
      setSnackbar({ open: true, message: "URL copied to clipboard", severity: "success" });
    } catch (err) {
      console.error("Copy to clipboard failed", err);
      setSnackbar({ open: true, message: "Failed to copy URL", severity: "error" });
    }
  };

  // Get file size in human readable format
  const getFileSize = (size) => {
    if (!size) return "Unknown";
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate appropriate grid size based on media type and view mode
  const getGridSize = () => {
    if (viewMode === "list") {
      return { xs: 12 }; // Full width for list view
    }
    
    switch(currentCategory) {
      case 'images': return { xs: 12, sm: 6, md: 4, lg: 3 };
      case 'videos': return { xs: 12, sm: 6, md: 4 };
      case 'audio': return { xs: 12, sm: 6 };
      case 'documents': return { xs: 12, sm: 6, md: 4 };
      default: return { xs: 12, sm: 6, md: 4 };
    }
  };

  // Get appropriate icon for file type
  const getFileIcon = (mimeType) => {
    if (!mimeType) return <DescriptionIcon />;
    if (mimeType.startsWith('image/')) return <ImageIcon />;
    if (mimeType.startsWith('video/')) return <VideoLibraryIcon />;
    if (mimeType.startsWith('audio/')) return <AudiotrackIcon />;
    return <DescriptionIcon />;
  };

  // Get the appropriate title for the current type
  const getTypeTitle = () => {
    switch(currentCategory) {
      case 'images': return 'Image Gallery';
      case 'videos': return 'Video Collection';
      case 'audio': return 'Audio Library';
      case 'documents': return 'Document Repository';
      default: return 'Media Files';
    }
  };

  // Toggle star/favorite status for a file (client-side only)
  const toggleFavorite = (file) => {
    const updatedFiles = files.map(f => {
      if (f.name === file.name) {
        return { ...f, favorite: !f.favorite };
      }
      return f;
    });
    
    setFiles(updatedFiles);
    setSnackbar({ 
      open: true, 
      message: file.favorite ? "Removed from favorites" : "Added to favorites", 
      severity: "success" 
    });
  };

  // Render empty state
  const renderEmptyState = () => (
    <Box 
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        my: 8,
        p: 4,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.5),
        backdropFilter: 'blur(10px)',
        textAlign: 'center'
      }}
    >
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Box 
          component="img" 
          src={`/illustrations/empty-${currentCategory}.svg`} 
          alt="No files" 
          sx={{ width: '100%', maxWidth: 200, mb: 3, opacity: 0.7 }}
        />
      </motion.div>
      
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Typography variant="h6" gutterBottom>
          No {currentCategory} found
        </Typography>
      </motion.div>
      
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload your first file to get started
        </Typography>
      </motion.div>
      
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          variant="contained" 
          component="label" 
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
          sx={{
            px: 3,
            py: 1.2,
            background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
          }}
        >
          Upload {currentCategory.slice(0, -1)}
          <input 
            type="file" 
            hidden 
            ref={fileInputRef}
            accept={acceptTypes[currentCategory]} 
            onChange={handleFileChange} 
          />
        </Button>
      </motion.div>
    </Box>
  );

  // Skeleton loading placeholders
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[...Array(8)].map((_, index) => (
        <Grid item key={index} {...getGridSize()}>
          <Card sx={{ height: '100%' }}>
            <Skeleton variant="rectangular" height={viewMode === "list" ? 100 : 200} />
            <CardContent>
              <Skeleton variant="text" width="70%" height={30} />
              <Skeleton variant="text" width="40%" height={20} />
            </CardContent>
            <CardActions>
              <Skeleton variant="circular" width={36} height={36} sx={{ mr: 1 }} />
              <Skeleton variant="circular" width={36} height={36} sx={{ mr: 1 }} />
              <Skeleton variant="circular" width={36} height={36} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render grid view
  const renderGridView = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Grid container spacing={3}>
        <AnimatePresence>
          {filteredFiles.map((file) => (
            <Grid item key={file.name} {...getGridSize()}>
              <motion.div variants={itemVariants}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                    borderLeft: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
                  }}
                >
                  {/* Favorite icon */}
                  <IconButton
                    onClick={() => toggleFavorite(file)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      bgcolor: alpha(theme.palette.background.paper, 0.7),
                      backdropFilter: 'blur(4px)',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                      }
                    }}
                    size="small"
                  >
                    {file.favorite ? (
                      <StarIcon sx={{ color: theme.palette.warning.main }} />
                    ) : (
                      <StarBorderIcon />
                    )}
                  </IconButton>

                  {/* Media content */}
                  {file.mimetype?.startsWith("image/") && (
                    <CardMedia 
                      component="img" 
                      height={200} 
                      image={file.url} 
                      alt={file.name}
                      sx={{ 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                  )}

                  {file.mimetype?.startsWith("video/") && (
                    <Box sx={{ position: 'relative', pt: '56.25%' /* 16:9 aspect ratio */ }}>
                      <Box
                        component="video"
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '100%', 
                          height: '100%',
                          objectFit: 'cover',
                          backgroundColor: '#000'
                        }}
                        controls
                      >
                        <source src={file.url} type={file.mimetype} />
                        Your browser does not support the video tag.
                      </Box>
                    </Box>
                  )}

                  {file.mimetype?.startsWith("audio/") && (
                    <Box 
                      sx={{ 
                        p: 3, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        backgroundColor: alpha(theme.palette.primary.dark, 0.05),
                      }}
                    >
                      <Box 
                        component="img" 
                        src="/icons/audio-wave.svg" 
                        alt="Audio" 
                        sx={{ 
                          width: '100%', 
                          height: 80, 
                          objectFit: 'contain',
                          opacity: 0.7,
                          mb: 2
                        }}
                      />
                      <Box
                        component="audio"
                        sx={{ width: '100%' }}
                        controls
                      >
                        <source src={file.url} type={file.mimetype} />
                        Your browser does not support the audio tag.
                      </Box>
                    </Box>
                  )}

                  {!file.mimetype?.startsWith("image/") &&
                   !file.mimetype?.startsWith("video/") &&
                   !file.mimetype?.startsWith("audio/") && (
                    <Box 
                      sx={{ 
                        p: 4, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 150,
                        backgroundColor: alpha(theme.palette.primary.dark, 0.05),
                      }}
                    >
                      <FolderIcon 
                        sx={{ 
                          fontSize: 60, 
                          color: alpha(theme.palette.primary.main, 0.8), 
                          mb: 2,
                          filter: `drop-shadow(0 2px 5px ${alpha(theme.palette.primary.main, 0.5)})`,
                        }} 
                      />
                    </Box>
                  )}

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="subtitle1" 
                      component="div" 
                      noWrap
                      sx={{ 
                        fontWeight: 500,
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {file.name}
                    </Typography>
                    
                    <Stack 
                      direction="row" 
                      spacing={1} 
                      alignItems="center" 
                      sx={{ mt: 1, color: 'text.secondary', fontSize: '0.75rem' }}
                    >
                      <StorageIcon sx={{ fontSize: '0.875rem' }} />
                      <Typography variant="body2">{getFileSize(file.size)}</Typography>
                      
                      <AccessTimeIcon sx={{ fontSize: '0.875rem', ml: 1 }} />
                      <Typography variant="body2">{formatDate(file.lastModified)}</Typography>
                    </Stack>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    {file.uploadedBy && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <PersonIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 0.5 }} />
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontStyle: 'italic',
                            color: file.uploadedBy === CURRENT_USER ? theme.palette.info.main : 'text.secondary'
                          }}
                        >
                          {file.uploadedBy === CURRENT_USER ? 'You' : file.uploadedBy}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => showFileDetails(file)}
                        color="info"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Download">
                      <IconButton 
                        size="small" 
                        onClick={() => downloadFile(file)}
                        color="primary"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Copy URL">
                      <IconButton 
                        size="small" 
                        onClick={() => copyUrlToClipboard(file.url)}
                        color="secondary"
                      >
                        <LinkIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => confirmDelete(file)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>
    </motion.div>
  );

  // Render list view
  const renderListView = () => (
    <TableContainer component={Paper} sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.6) }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Modified</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <AnimatePresence>
            {filteredFiles.map((file) => (
              <TableRow
                key={file.name}
                component={motion.tr}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                sx={{ 
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {file.favorite && (
                      <StarIcon 
                        fontSize="small" 
                        sx={{ 
                          mr: 1, 
                          color: theme.palette.warning.main,
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 0.6 },
                            '50%': { opacity: 1 },
                            '100%': { opacity: 0.6 },
                          }
                        }} 
                      />
                    )}
                    <Avatar
                      variant="rounded"
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 2,
                        bgcolor: file.mimetype?.startsWith("image/")
                          ? theme.palette.primary.dark
                          : file.mimetype?.startsWith("video/")
                          ? theme.palette.error.dark
                          : file.mimetype?.startsWith("audio/")
                          ? theme.palette.success.dark
                          : theme.palette.warning.dark
                      }}
                    >
                      {getFileIcon(file.mimetype)}
                    </Avatar>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {file.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {file.mimetype?.split('/')[1]?.toUpperCase() || "Unknown"}
                </TableCell>
                <TableCell>{getFileSize(file.size)}</TableCell>
                <TableCell>{formatDate(file.lastModified)}</TableCell>
                <TableCell>
                  <Chip 
                    label={file.uploadedBy === CURRENT_USER ? 'You' : file.uploadedBy}
                    size="small"
                    color={file.uploadedBy === CURRENT_USER ? "primary" : "default"}
                    variant={file.uploadedBy === CURRENT_USER ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton 
                      size="small" 
                      onClick={() => showFileDetails(file)}
                      sx={{ mr: 1 }}
                      color="info"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Download">
                    <IconButton 
                      size="small" 
                      onClick={() => downloadFile(file)}
                      sx={{ mr: 1 }}
                      color="primary"
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={file.favorite ? "Remove Favorite" : "Add Favorite"}>
                    <IconButton 
                      size="small" 
                      onClick={() => toggleFavorite(file)}
                      sx={{ mr: 1 }}
                      color={file.favorite ? "warning" : "default"}
                    >
                      {file.favorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      onClick={() => confirmDelete(file)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </AnimatePresence>
          
          {filteredFiles.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No files found matching your criteria
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      {/* Header Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: alpha(theme.palette.background.paper, 0.5),
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: `0 10px 30px -10px ${alpha('#000', 0.2)}`,
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '100%', 
          opacity: 0.03, 
          backgroundImage: `url(/patterns/${currentCategory}-pattern.svg)`,
          backgroundSize: 'cover',
          zIndex: 0
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196f3, #1e88e5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {getTypeTitle()}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Manage your {currentCategory} files with ease. Upload, download, and organize your media collection.
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Button 
                variant="contained" 
                component="label" 
                startIcon={<CloudUploadIcon />}
                disabled={uploading}
                sx={{
                  px: 2,
                  py: 1,
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                Upload {currentCategory.slice(0, -1)}
                <input 
                  type="file" 
                  hidden 
                  ref={fileInputRef}
                  accept={acceptTypes[currentCategory]} 
                  onChange={handleFileChange} 
                />
              </Button>
            </Grid>
            
            <Grid item>
              <Tooltip title="Filter">
                <IconButton 
                  onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                  color={filterSize !== 'all' ? 'primary' : 'default'}
                  sx={{ 
                    bgcolor: filterSize !== 'all' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  }}
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            
            <Grid item>
              <Tooltip title="Sort">
                <IconButton 
                  onClick={(e) => setSortAnchorEl(e.currentTarget)}
                  color="default"
                >
                  <SortIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            
            <Grid item>
              <ButtonGroup 
                variant="outlined" 
                size="small" 
                sx={{ 
                  ml: 1,
                  '& .MuiButtonGroup-grouped': {
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  },
                }}
              >
                <Button 
                  color={viewMode === 'grid' ? 'primary' : 'inherit'}
                  onClick={() => setViewMode('grid')}
                  sx={{ 
                    bgcolor: viewMode === 'grid' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  }}
                >
                  <GridViewIcon fontSize="small" />
                </Button>
                <Button 
                  color={viewMode === 'list' ? 'primary' : 'inherit'}
                  onClick={() => setViewMode('list')}
                  sx={{ 
                    bgcolor: viewMode === 'list' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  }}
                >
                  <ViewListIcon fontSize="small" />
                </Button>
              </ButtonGroup>
            </Grid>
            
            <Grid item>
              <Tooltip title="Refresh">
                <IconButton 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{ 
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            
            <Grid item xs>
              {filteredFiles.length > 0 && (
                <Chip 
                  label={`${filteredFiles.length} ${filteredFiles.length === 1 ? 'file' : 'files'}`} 
                  size="small" 
                  sx={{ 
                    ml: { xs: 0, sm: 'auto' }, 
                    mr: { xs: 0, sm: 2 },
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                  }}
                />
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Upload Progress */}
      {uploading && (
        <Fade in={uploading} timeout={500}>
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(5px)',
            }}
            elevation={2}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CircularProgress size={20} thickness={5} sx={{ mr: 2 }} />
              <Typography variant="body2">
                Uploading {currentFile?.name || "file"}... {uploadProgress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Paper>
        </Fade>
      )}

      {/* Loading State */}
      {loading && renderSkeletons()}

      {/* Empty State */}
      {!loading && filteredFiles.length === 0 && renderEmptyState()}

      {/* Files Grid/List */}
      {!loading && filteredFiles.length > 0 && (
        <Box sx={{ mb: 4 }}>
          {viewMode === 'grid' ? renderGridView() : renderListView()}
        </Box>
      )}

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={sortMenuOpen}
        onClose={() => setSortAnchorEl(null)}
        sx={{ '& .MuiPaper-root': { borderRadius: 2, minWidth: 180 } }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Sort By
        </Typography>
        <Divider />
        {[
          { value: 'newest', label: 'Newest First' },
          { value: 'oldest', label: 'Oldest First' },
          { value: 'name-asc', label: 'Name (A-Z)' },
          { value: 'name-desc', label: 'Name (Z-A)' },
          { value: 'size-asc', label: 'Size (Small to Large)' },
          { value: 'size-desc', label: 'Size (Large to Small)' },
        ].map((option) => (
          <MenuItem 
            key={option.value}
            selected={sortOrder === option.value}
            onClick={() => {
              setSortOrder(option.value);
              setSortAnchorEl(null);
            }}
          >
            {option.label}
            {sortOrder === option.value && (
              <Box sx={{ ml: 'auto', color: theme.palette.primary.main }}>✓</Box>
            )}
          </MenuItem>
        ))}
      </Menu>
      
      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={filterMenuOpen}
        onClose={() => setFilterAnchorEl(null)}
        sx={{ '& .MuiPaper-root': { borderRadius: 2, minWidth: 180 } }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Filter By Size
        </Typography>
        <Divider />
        {[
          { value: 'all', label: 'All Sizes' },
          { value: 'small', label: 'Small (< 1MB)' },
          { value: 'medium', label: 'Medium (1MB - 10MB)' },
          { value: 'large', label: 'Large (> 10MB)' },
        ].map((option) => (
          <MenuItem 
            key={option.value}
            selected={filterSize === option.value}
            onClick={() => {
              setFilterSize(option.value);
              setFilterAnchorEl(null);
            }}
          >
            {option.label}
            {filterSize === option.value && (
              <Box sx={{ ml: 'auto', color: theme.palette.primary.main }}>✓</Box>
            )}
          </MenuItem>
        ))}
      </Menu>

      {/* Duplicate File Dialog */}
      <Dialog
        open={duplicateDialog}
        onClose={() => setDuplicateDialog(false)}
        aria-labelledby="duplicate-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle id="duplicate-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          File Already Exists
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            A file with the name "{currentFile?.name}" already exists. What would you like to do?
          </DialogContentText>
          
          <Typography variant="subtitle2" gutterBottom>
            Rename file:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleReplaceFile} color="warning">
            Replace Existing
          </Button>
          <Button onClick={handleRenameFile} color="primary" variant="contained">
            Upload as New
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Details Dialog */}
      <Dialog
        open={fileDetailsDialog}
        onClose={() => setFileDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        {selectedFile && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  variant="rounded" 
                  sx={{ 
                    mr: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.8) 
                  }}
                >
                  {getFileIcon(selectedFile.mimetype)}
                </Avatar>
                <Typography variant="h6" noWrap sx={{ maxWidth: '250px' }}>
                  {selectedFile.name}
                </Typography>
              </Box>
              <IconButton onClick={() => setFileDetailsDialog(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {selectedFile.mimetype?.startsWith("image/") && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.name} 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px', 
                      objectFit: 'contain',
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[5]
                    }} 
                  />
                </Box>
              )}
              
              {selectedFile.mimetype?.startsWith("video/") && (
                <Box sx={{ mb: 3 }}>
                  <video 
                    src={selectedFile.url} 
                    controls 
                    style={{ 
                      width: '100%', 
                      maxHeight: '300px',
                      borderRadius: theme.shape.borderRadius,
                      backgroundColor: '#000'
                    }} 
                  />
                </Box>
              )}
              
              {selectedFile.mimetype?.startsWith("audio/") && (
                <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.background.paper, 0.3), borderRadius: 1 }}>
                  <Box 
                    component="img" 
                    src="/icons/audio-wave.svg" 
                    alt="Audio" 
                    sx={{ 
                      width: '100%', 
                      height: 80, 
                      objectFit: 'contain',
                      opacity: 0.7,
                      mb: 2
                    }}
                  />
                  <audio controls style={{ width: '100%' }}>
                    <source src={selectedFile.url} type={selectedFile.mimetype} />
                    Your browser does not support the audio tag.
                  </audio>
                </Box>
              )}
              
              <Typography variant="subtitle1" gutterBottom>
                File Details
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                    <Typography variant="overline" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body2">
                      {selectedFile.mimetype || "Unknown"}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                    <Typography variant="overline" color="text.secondary">
                      Size
                    </Typography>
                    <Typography variant="body2">
                      {getFileSize(selectedFile.size)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                    <Typography variant="overline" color="text.secondary">
                      Last Modified
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(selectedFile.lastModified)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                    <Typography variant="overline" color="text.secondary">
                      Uploaded By
                    </Typography>
                    <Typography variant="body2">
                      {selectedFile.uploadedBy === CURRENT_USER ? 'You' : selectedFile.uploadedBy}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" gutterBottom>
                File Location
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={selectedFile.url}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton 
                      size="small" 
                      onClick={() => copyUrlToClipboard(selectedFile.url)}
                      color="primary"
                    >
                      <LinkIcon />
                    </IconButton>
                  ),
                  sx: { bgcolor: alpha(theme.palette.background.paper, 0.5) }
                }}
                size="small"
              />
            </DialogContent>
            <DialogActions>
              <Button 
                startIcon={<StarIcon />}
                color="warning"
                onClick={() => {
                  toggleFavorite(selectedFile);
                  setSelectedFile(prev => ({...prev, favorite: !prev.favorite}));
                }}
              >
                {selectedFile.favorite ? 'Remove Favorite' : 'Add Favorite'}
              </Button>
              <Button 
                startIcon={<DownloadIcon />}
                color="primary"
                onClick={() => downloadFile(selectedFile)}
              >
                Download
              </Button>
              <Button 
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => {
                  setFileDetailsDialog(false);
                  confirmDelete(selectedFile);
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <DeleteIcon color="error" sx={{ mr: 1 }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={deleteFile} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FileManager;