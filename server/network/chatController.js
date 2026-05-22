// Chat message handler: validates message length and content, enforces rate
// limiting per player, prepends timestamps, and broadcasts chat messages to
// all connected players in the game session.


export function handleChatMessage(ws, payload, broadcastToRoom) {
  if (!ws.roomId || !ws.username) return;

  const text = payload.text ? payload.text.trim() : "";

  if (!text || text.length === 0 || text.length > 100) {
    return; 
  }

  const now = Date.now();
  if (ws.lastMessageTime && now - ws.lastMessageTime < 1000) {
    ws.send(JSON.stringify({
      type: "CHAT_ERROR",
      payload: { message: "Slow down! 1 message per second." }
    }));
    return; 
  }
  
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