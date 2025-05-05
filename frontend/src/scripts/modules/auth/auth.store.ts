import type { GetMeResponse } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { createStore } from "../../global/store";
import { createStatus } from "../../ui/components/Status";
import { createTotpModal, createTotpTokenForm } from "../../ui/layout/TotpModal";
import { sendApiRequest } from "../../utils/api";
import { replaceChildren } from "../../utils/dom-helper";
import { closeSocketConn, establishSocketConn } from "../ws/ws.service";
import { tryLoginWithTotp } from "./auth.service";

type AuthState = {
    isAuthenticated: boolean;
    totpRequired: boolean;
    username: string | null | undefined;
    displayName: string | null | undefined;
    tempAuthString: string | null;
};

export const emptyAuthState = {
    isAuthenticated: false,
    totpRequired: false,
    username: null,
    displayName: null,
    tempAuthString: null,
};

export const initAuthState = async (): Promise<AuthState> => {
    const result = await sendApiRequest.get<GetMeResponse>(`${CONST.API.USER}/me`);
    if (result.isErr() || !result.value.success) return emptyAuthState;

    const { username, displayName } = result.value.data;
    return {
        isAuthenticated: true,
        totpRequired: false,
        username,
        displayName,
        tempAuthString: null,
    };
};

export const authStore = createStore<AuthState>(emptyAuthState);

authStore.subscribe(async (state) => {
    log.debug("AuthStore subscriber trigged");

    // Replace login form with totp modal if totp is being required
    if (state.totpRequired) {
        const el = document.getElementById(CONST.ID.LOGIN_FORM);
        if (!el) return log.error("Fail to find login form: auth store, totpRequired");

        const tokenForm = createTotpTokenForm("login");
        const { statusEl, showErr } = createStatus();
        tokenForm.appendChild(statusEl);
        tokenForm.addEventListener("submit", async (evt) => {
            // Very important, to prevent reload
            evt.preventDefault();

            const tryLogin = await tryLoginWithTotp();
            if (tryLogin.isErr()) return showErr(tryLogin.error);
        });

        replaceChildren(el, [tokenForm]);
        return;
    }

    // Redirect to default page and close socket connection once logged out
    if (!state.isAuthenticated) {
        navigateTo(CONST.ROUTE.DEFAULT);
        closeSocketConn();
        return;
    }

    // Redirect to home and open socket connection once successfully authenticated
    navigateTo(CONST.ROUTE.HOME);
    establishSocketConn();
});
