import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import { setupSockets } from "./network/socketHandler.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const BASE_DIR = path.join(dirname, "..");

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const server = http.createServer(async (req, res) => {

  let safeUrl = req.url === "/" ? "/client/index.html" : req.url;

  safeUrl = decodeURI(safeUrl);
  const fullPath = path.join(BASE_DIR, safeUrl);
  
  if (!fullPath.startsWith(BASE_DIR)) {
    res.setHeader("Content-Type", "text/plain");
    res.statusCode = 403;
    return res.end("403 Forbidden: Access Denied");
  }

  let extname = path.extname(fullPath).toLowerCase();
  let contentType = MIME_TYPES[extname] || "application/octet-stream";

  try {
    const data = await fs.readFile(fullPath);
    res.setHeader("Content-Type", contentType);
    res.statusCode = 200;
    res.end(data);
  } catch (error) {
    res.setHeader("Content-Type", "text/plain");
    if (error.code === "ENOENT") {
      res.statusCode = 404;
      res.end("404 File Not Found");
    } else {
      res.statusCode = 500;
      res.end("500 Internal Server Error");
    }
  }
});

const webs = new WebSocketServer({ server });
setupSockets(webs); 

const port = 3000;
server.listen(port, () => {
  console.log(`🚀 Server is running securely on http://localhost:${port}`);
});