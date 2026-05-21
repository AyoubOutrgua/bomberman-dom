// Game state machine: manages lobby → countdown → active → round-end phases.
// Tracks connected players, validates moves, enforces bomb/explosion rules,
// detects deaths, and broadcasts full state updates to all clients.
