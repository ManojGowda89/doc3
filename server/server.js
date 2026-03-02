import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors"; // ✅ Import cors
import { createApp } from "../mjs/server.config.js";
import router from "./src/main.js";
import unmaper from "unmaper";

const { app, PORT } = createApp();

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:8000",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5001",
  "http://localhost:12000",
  "http://localhost:13000",
  "https://files.skoegle.co.in",
  "https://vmarg.skoegle.com",
  "https://dmarg.skoegle.com",
  "https://skoegle.com",
  "https://skoegle.in",
  "https://skocloud-cdn.skoegle.com",
   "https://www.skocloud-cdn.skoegle.com",
   "http://192.168.29.4:8000",
  "https://skoegle.co.in", 
];

// ✅ CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies / auth headers
  })
);

// Enable body parser
app.use(express.json({ limit: "1024mb" })); // Large limit for base64 uploads

// Static folder setup (Serve uploads folder at /media)
app.use("/media", express.static(path.join(process.cwd(), "uploads")));

// Mount routes
app.use("/api", router);

// Example ping route
app.use("/api/ping", unmaper);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
