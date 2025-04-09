import { createStore } from "../../global/store";

export type AuthState = {
    isAuthenticated: boolean;
    totpRequired: boolean;
    token: string | null;
    id: string | null;
    username: string | null;
};

export const defaultAuthState: AuthState = {
    isAuthenticated: false,
    totpRequired: false,
    token: null,
    id: null,
    username: null,
};

export const authStore = createStore<AuthState>(defaultAuthState);
