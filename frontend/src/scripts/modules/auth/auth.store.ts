import type { GetMeResponse } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { createStore } from "../../global/store";
import { createTotpModal } from "../../ui/layout/TotpModal";
import { sendApiRequest } from "../../utils/api";
import { closeSocketConn, establishSocketConn } from "../ws/ws.service";

type AuthState = {
    isAuthenticated: boolean;
    totpRequired: boolean;
    username: string | null;
    displayName: string | null;
    password: string | null;
};

export const emptyAuthState = {
    isAuthenticated: false,
    totpRequired: false,
    username: null,
    displayName: null,
    password: null,
};

export const initAuthState = async (): Promise<AuthState> => {
    const result = await sendApiRequest.get<GetMeResponse>(`${window.cfg.url.user}/me`);

    if (result.isErr() || !result.value.success) {
        return emptyAuthState;
    }

    const { username, displayName } = result.value.data;
    return {
        isAuthenticated: true,
        totpRequired: false,
        username,
        displayName,
        password: null,
    };
};

export const authStore = createStore<AuthState>(emptyAuthState);

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
    if (!state.isAuthenticated) {
        navigateTo(window.cfg.url.default);
        closeSocketConn();
        return;
    }

    // Redirect to home and open socket connection once successfully authenticated
    navigateTo(window.cfg.url.home);
    establishSocketConn();
});
