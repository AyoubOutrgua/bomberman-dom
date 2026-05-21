import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import { randomUUID } from "node:crypto";

const rooms = new Map();

function createRoom() {
  const newRoom = {
    id: randomUUID(), 
    players: [],               
    status: "waiting",         
    timer: null,
    timeLeft: 0,               
    phase: "waiting" 
  };
  
  rooms.set(newRoom.id, newRoom); 
  return newRoom;
}

function findAvailableRoom() {
  for (const room of rooms.values()) {
    if(room.status === "waiting" && room.players.length < 4) {
      return room;
    }
  }
  return null;
}

function joinPlayer(ws, username) {
  if (!username || username.trim() === "" || username.length > 15) {
    ws.send(JSON.stringify({ 
      type: "JOIN_ERROR", 
      payload: { message: "Invalid username!" } 
    }));
    return;
  }

  let room = findAvailableRoom();
  if (!room) {
    room = createRoom();
  }
  
  const isTaken = room.players.some(player => player.username === username);
  
  if (isTaken) {
    ws.send(JSON.stringify({ 
      type: "JOIN_ERROR", 
      payload: { message: "Username is already taken in this room!" } 
    }));
    return;
  }

  const player = { id: randomUUID(), socket: ws, username: username };
  room.players.push(player);

  ws.roomId = room.id;
  ws.playerId = player.id;
  ws.username = username;
  
  ws.send(JSON.stringify({ 
    type: "JOIN_SUCCESS", 
    payload: { roomId: room.id, username: username } 
  }));
  
  broadcastToRoom(room.id, {
    type: "PLAYER_COUNT",
    payload: { 
      count: room.players.length, 
      players: room.players.map(p => p.username) 
    }
  });
  
  handleRoomTimer(room.id);
}

function broadcastToRoom(roomId, messageData) {
  const room = rooms.get(roomId);
  if (room) {
    const stringMessage = JSON.stringify(messageData);
    for (const player of room.players) {
      if (player.socket.readyState === 1) {
        player.socket.send(stringMessage);
      }
    }
  }
}

function handleRoomTimer(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.players.length < 2) {
    if (room.timer) {
      clearInterval(room.timer);
      room.timer = null;
    }
    room.status = "waiting";
    room.phase = "waiting";
    
    broadcastToRoom(roomId, { type: "TIMER_STOP" });
    return;
  }

  if (room.players.length >= 2 && !room.timer) {
    room.phase = "soft_countdown";
    room.timeLeft = 20;
    room.timer = setInterval(() => {
      room.timeLeft--;
      broadcastToRoom(roomId, {
        type: "TIMER_UPDATE",
        payload: { timeLeft: room.timeLeft, phase: room.phase }
      });
      
      if (room.timeLeft <= 0 && room.phase === "soft_countdown") {
        room.phase = "locked_countdown"; 
        room.status = "locked";          
        room.timeLeft = 10;              
      }
      else if (room.timeLeft <= 0 && room.phase === "locked_countdown") {
        clearInterval(room.timer);
        room.timer = null;
        room.status = "playing";   
        broadcastToRoom(roomId, { type: "START_GAME" });
      }
    }, 1000);
  }

  if (room.players.length === 4 && room.phase === "soft_countdown") {
    room.phase = "locked_countdown";
    room.status = "locked";
    room.timeLeft = 10;
  }
}

function handlePlayerMovement(playerId, roomId, payload) {
  broadcastToRoom(roomId, {
    type: "PLAYER_MOVED",
    payload: {
      id: playerId,
      direction: payload.direction
    }
  });
}

function handleBombPlacement(playerId, roomId, payload) {
  broadcastToRoom(roomId, {
    type: "BOMB_PLACED",
    payload: {
      id: playerId
    }
  });
}

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
  let safeUrl = req.url === "/" ? "/index.html" : req.url;

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

webs.on("connection", (ws, req) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === "JOIN_ROOM") {
         const requestedUsername = data.payload.username;
         joinPlayer(ws, requestedUsername);
      } 
      else if (data.type === "CHAT_MESSAGE") {
         if (ws.roomId && ws.username) {
           const text = data.payload.text ? data.payload.text.trim() : "";
           
           if (!text || text.length === 0 || text.length > 100) return; 

           const now = Date.now();
           if (ws.lastMessageTime && now - ws.lastMessageTime < 1000) return; 
           ws.lastMessageTime = now;

           const messageToSend = {
             type: "CHAT_MESSAGE",
             payload: {
               username: ws.username,    
               text: text   
             }
           };
           broadcastToRoom(ws.roomId, messageToSend);
         }
      }
      else if (data.type === "MOVE") {
         if (ws.roomId && ws.playerId) {
           const room = rooms.get(ws.roomId);
           if (room && room.status === "playing") {
             handlePlayerMovement(ws.playerId, ws.roomId, data.payload);
           }
         }
      }
      else if (data.type === "PLACE_BOMB") {
         if (ws.roomId && ws.playerId) {
           const room = rooms.get(ws.roomId);
           if (room && room.status === "playing") {
             handleBombPlacement(ws.playerId, ws.roomId, data.payload);
           }
         }
      }
    } catch (error) {
    }
  });

  ws.on("close", () => {
    if (ws.roomId && ws.playerId) {
      const room = rooms.get(ws.roomId);
      
      if (room) {
        room.players = room.players.filter(player => player.id !== ws.playerId);
        
        if (room.players.length === 0) {
          rooms.delete(room.id);
        } else {
          if (room.status === "locked" && room.players.length < 4) {
            clearInterval(room.timer);
            room.timer = null;
            room.status = "waiting";
            room.phase = "soft_countdown";
            room.timeLeft = 20;
          }

          broadcastToRoom(room.id, {
            type: "PLAYER_COUNT",
            payload: { 
              count: room.players.length, 
              players: room.players.map(p => p.username) 
            }
          });

          handleRoomTimer(room.id);
        }
      }
    }
  });
});

const port = 3000;

server.listen(port, () => {
  console.log(`Server is running securely on http://localhost:${port}`);
});