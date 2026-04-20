import 'dotenv/config';  // This MUST be the very first line — loads .env immediately

import express, { type Request, Response, NextFunction, RequestHandler } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import os from 'os';

// Debug: Confirm key env vars are actually loaded
console.log('[ENV DEBUG] NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('[ENV DEBUG] SAFEPAY_SECRET_KEY:', process.env.SAFEPAY_SECRET_KEY ? 'present' : 'MISSING');
console.log('[ENV DEBUG] SAFEPAY_ENV:', process.env.SAFEPAY_ENV || 'MISSING');
console.log('[ENV DEBUG] DATABASE_URL:', process.env.DATABASE_URL ? 'present' : 'MISSING');

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));

// Serve static files from public directory (for uploaded media)
app.use(express.static("public"));

// Request logging middleware — fully typed to avoid property errors
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: unknown = undefined;

  // Properly type the json override
  const originalJson = res.json;
  res.json = function (body: unknown, ...args: unknown[]) {
    capturedJsonResponse = body;
    return originalJson.call(res, body, ...args);
  };

  // Use res.once instead of res.on (single event, better typing)
  res.once("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Global error handler — fully typed
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('[GLOBAL ERROR]', err);
    res.status(status).json({ message });
  });

  // Setup Vite in development only (after all other routes)
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  const host = os.platform() === 'win32' ? "localhost" : "0.0.0.0";

  server.listen(port, host, () => {
    log(`serving on port ${port}`);
    log(`server started at http://${host}:${port}`);
    log(`API docs available at http://${host}:${port}/api/docs`);
  });
})();