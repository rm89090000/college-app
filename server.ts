import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { analyzeApplication, analyzeHandwriting, extractAppData } from "./server/geminiHandlers";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// API Route: Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Route: Analyze College Application
app.post("/api/analyze-application", async (req, res) => {
  try {
    const jsonResult = await analyzeApplication(req.body);
    res.json({ success: true, data: jsonResult });
  } catch (error: any) {
    console.error("Error analyzing application:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to analyze application" });
  }
});

// API Route: Analyze Handwriting Sample via Vision
app.post("/api/analyze-handwriting", async (req, res) => {
  try {
    const jsonResult = await analyzeHandwriting(req.body);
    res.json({ success: true, data: jsonResult });
  } catch (error: any) {
    console.error("Error analyzing handwriting:", error);
    res.status(error.status || 500).json({ success: false, error: error.message || "Failed to analyze handwriting sample" });
  }
});

// API Route: Extract Structured Application Data from Uploaded Document/Text
app.post("/api/extract-app-data", async (req, res) => {
  try {
    const jsonResult = await extractAppData(req.body);
    res.json({ success: true, data: jsonResult });
  } catch (error: any) {
    console.error("Error extracting app data:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to parse application document" });
  }
});

// Vite Middleware & Static Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
