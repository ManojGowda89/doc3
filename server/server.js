import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { createApp } from "../mjs/server.config.js";
import router from "./src/main.js";

const { app, PORT } = createApp();

// Enable body parser
app.use(express.json({ limit: '1024mb' })); // Large limit for base64 uploads

// Static folder setup (Serve uploads folder at /media)
app.use("/media", express.static(path.join(process.cwd(), "uploads")));

// Mount routes
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
