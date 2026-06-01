import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { handleChatMessage } from "./chatController.js";

export const gameEvents = new EventEmitter();
const rooms = new Map();

export function broadcastToRoom(roomId, messageData) {
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
        gameEvents.emit("GAME_STARTED", room.id);
      }
    }, 1000);
  }

  if (room.players.length === 4 && room.phase === "soft_countdown") {
    room.phase = "locked_countdown";
    room.status = "locked";
    room.timeLeft = 10;
  }
}

export function setupSockets(webs) {
  webs.on("connection", (ws, req) => {
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "JOIN_ROOM") {
           const requestedUsername = data.payload.username;
           joinPlayer(ws, requestedUsername);
        } 
        else if (data.type === "CHAT_MESSAGE") {
           handleChatMessage(ws, data.payload, broadcastToRoom);
        }
        else if (data.type === "MOVE") {
           if (ws.roomId && ws.playerId) {
             const room = rooms.get(ws.roomId);
             if (room && room.status === "playing") {
               gameEvents.emit("PLAYER_MOVED", ws.playerId, ws.roomId, data.payload);
             }
           }
        }
        else if (data.type === "PLACE_BOMB") {
           if (ws.roomId && ws.playerId) {
             const room = rooms.get(ws.roomId);
             if (room && room.status === "playing") {
               gameEvents.emit("BOMB_PLACED", ws.playerId, ws.roomId, data.payload);
             }
           }
        }
      } catch (error) {
         console.warn(` Invalid message from [${ws.username || "unknown"}]:`, error.message)
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
              payload: { count: room.players.length, players: room.players.map(p => p.username) }
            });
            handleRoomTimer(room.id);
          }
        }
      }
    });
  });
}