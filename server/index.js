// Entry point: HTTP + WebSocket server bootstrap.
// Serves static files from ../client/, sets up WebSocket server on the same
// port, and delegates connection handling to socketHandler.
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const ROOT = path.resolve(currentDir, "..");

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  const requestedPath = req.url === "/" ? "/client/index.html" : req.url;

  const filePath = path.join(ROOT, requestedPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("not found");
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "text/plain" });
    res.end(data);
  });
});

server.listen(3000, () => {
  console.log("\nServer running at http://localhost:3000");
});
