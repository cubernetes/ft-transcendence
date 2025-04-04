🔄 Needed Server Changes (Minimal):
✅ Allow JWT in query param or WebSocket headers.
✅ When upgrading WS, extract token, verify it, associate userId → WS connection.
✅ Track CLI vs. Web clients optionally via user-agent metadata.
✅ Need a system to match games and wait for opponents (Lobby)

🛠️ CLI Client Roadmap
Phase 1: Core Auth and Connection
CLI login via /auth/login
Store JWT in memory or local file
Connect to WebSocket game route using JWT
Maintain reconnect logic

Phase 2: Matchmaking & Input
Join match (manual or auto)
Capture keypresses (up, down, stop)
Send mapped "move" events via WS

Phase 3: Game State & Rendering
Receive state message
Render ASCII game board (e.g. using ANSI/blessed or ansi-escapes)
Redraw on each broadcast (~20 FPS)

Phase 4: Game Lifecycle Handling
Detect win/loss/disconnect via WS
Exit cleanly or return to menu

Phase 5: CLI UX Polishing
Main menu: [Login] [Play] [Exit]
Status bar: score, opponent name
Latency/Ping display (optional)

📁 CLI Project Structure (TS/Node)
cli/
├── src/
│ ├── index.ts // Entry point
│ ├── api.ts // Login / Auth
│ ├── ws.ts // WebSocket client
│ ├── input.ts // Read keys
│ ├── render.ts // Draw ASCII
│ └── gameLoop.ts // State sync
├── package.json
├── tsconfig.json
└── README.md

Use:
ws (WebSocket client)
readline + keypress or blessed
chalk for colors

📉 Input & Render Timing
Server tick: ~20 FPS (50ms interval)
Client should:
Throttle input sends (e.g., every 40–100ms)
Render at fixed frame rate (use setInterval)
