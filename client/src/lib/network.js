// WebSocket client singleton: manages connection lifecycle, serializes/
// deserializes JSON messages, dispatches incoming events to the state store,
// exposes send(event, payload) helper for components and game loop.
