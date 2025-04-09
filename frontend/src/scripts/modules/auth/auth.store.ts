import { createStore } from "../../global/store";
import { getWrapper } from "../../utils/api";

export type AuthState = {
    isAuthenticated: boolean;
    totpRequired: boolean;
    token: string | null;
    id: string | null;
    username: string | null;
};

export const emptyAuthState = {
    isAuthenticated: false,
    totpRequired: false,
    token: null,
    id: null,
    username: null,
};

export const initAuthState = async (): Promise<AuthState> => {
    const token = localStorage.getItem(window.cfg.label.token);
    if (!token) {
        return emptyAuthState;
    }

    const result = await getWrapper<{ success: boolean; data: Record<string, string> }>(
        `${window.cfg.url.user}/me`
    );

    if (result.isErr() || !result.value.success) {
        return emptyAuthState;
    }

    const { id, username } = result.value.data;
    return {
        isAuthenticated: true,
        totpRequired: false,
        token,
        id,
        username,
    };
};

export const authStore = createStore<AuthState>(await initAuthState());
