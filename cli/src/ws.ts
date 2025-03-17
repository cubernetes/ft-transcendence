import WebSocket from 'ws';

let socket: WebSocket;

export async function connectWS(): Promise<WebSocket> {
  const url = "ws://localhost:8080/ws";
  socket = new WebSocket(url);

  await new Promise<void>((resolve, reject) => {
    socket.on('open', () => {
      console.log("[ws] connected");
      resolve();
    });
    socket.on('error', reject);
  });

  socket.on('message', (data) => {
    // later: handle state messages here
  });

  return socket;
}

export function sendInput(ws: WebSocket, dir: "up" | "down" | "stop") {
  const msg = JSON.stringify({ type: "move", direction: dir });
  ws.send(msg);
}
