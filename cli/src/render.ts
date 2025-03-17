import WebSocket from 'ws';

interface GameState {
  ball: { x: number; y: number };
  players: {
    [id: string]: { paddleY: number; score: number };
  };
}

let state: GameState = {
  ball: { x: 10, y: 5 },
  players: {}
};

export function startRenderLoop(ws: WebSocket) {
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === "state") {
        state = msg;
      }
    } catch (e) {}
  });

  setInterval(() => {
    render(state);
  }, 50);
}

function render(state: GameState) {
  const rows = 20;
  const cols = 40;

  const screen: string[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ' ')
  );

  // Draw ball
  const bx = Math.min(cols - 1, Math.max(0, Math.round(state.ball.x)));
  const by = Math.min(rows - 1, Math.max(0, Math.round(state.ball.y)));
  screen[by][bx] = '●';

  // Draw paddles (simple vertical line at x=1 and x=cols-2)
  for (const [_, p] of Object.entries(state.players)) {
    const y = Math.round(p.paddleY);
    for (let dy = -1; dy <= 1; dy++) {
      const py = y + dy;
      if (py >= 0 && py < rows) {
        const x = 1; // later: determine left/right side
        screen[py][x] = '|';
      }
    }
  }

  // Render to console
  console.clear();
  for (const row of screen) {
    console.log(row.join(''));
  }
}
