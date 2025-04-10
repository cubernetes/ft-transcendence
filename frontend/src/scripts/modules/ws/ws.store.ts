import { createStore } from "../../global/store";

// What other data should be stored? start time? duration? names?
type WsState = {
    isConnected: boolean;
    conn: WebSocket | null;
};

export const emptyWsState: WsState = {
    isConnected: false,
    conn: null,
};

export const wsStore = createStore<WsState>(emptyWsState);
