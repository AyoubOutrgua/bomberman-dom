// WebSocket lifecycle manager: handles connection, disconnection, message
// routing. Validates incoming messages against known event types, dispatches
// game events to GameEngine and chat events to chatController, and manages
// broadcast to all or targeted players.
