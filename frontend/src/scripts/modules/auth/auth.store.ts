import type { GetMeResponse } from "@darrenkuro/pong-core";
import { createStore } from "../../global/store";
import { createTotpModal } from "../../ui/layout/TotpModal";
import { sendApiRequest } from "../../utils/api";
import { closeSocketConn, establishSocketConn } from "../ws/ws.service";

type AuthState = {
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

const initAuthState = async (): Promise<AuthState> => {
    const token = localStorage.getItem(window.cfg.label.token);

    if (!token) {
        return emptyAuthState;
    }

    const result = await sendApiRequest.get<GetMeResponse>(`${window.cfg.url.user}/me`);

    if (result.isErr() || !result.value.success) {
        return emptyAuthState;
    }

    const { id, username } = result.value.data;
    return {
        isAuthenticated: true,
        totpRequired: false,
        token,
        id: String(id),
        username,
    };
};

export const authStore = createStore<AuthState>(emptyAuthState);

initAuthState().then((initialState) => {
    authStore.set(initialState);
});

authStore.subscribe(async (state) => {
    window.log.debug("AuthStore subscriber trigged");

    // Replace login form with totp modal if totp is being required
    if (state.totpRequired) {
        const el = document.getElementById(window.cfg.id.loginForm);
        if (!el) {
            window.log.error("Unable to find login form when totp is required");
            return;
        }

        const modalEl = await createTotpModal();
        el.innerHTML = "";
        el.appendChild(modalEl);
        return;
    }

    // Redirect to default page and close socket connection once logged out
    if (!state.isAuthenticated || !state.token) {
        window.location.href = window.cfg.url.default;
        closeSocketConn();
        return;
    }

    // Redirect to home and open socket connection once successfully authenticated
    window.location.href = window.cfg.url.home;
    establishSocketConn(state.token);
});
