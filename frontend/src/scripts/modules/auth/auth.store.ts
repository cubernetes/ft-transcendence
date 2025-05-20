import type { GetMePayload } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { createStore } from "../../global/store";
import { createStatus } from "../../ui/components/Status";
import { createTotpTokenForm } from "../../ui/layout/TotpModal";
import { sendApiRequest } from "../../utils/api";
import { replaceChildren } from "../../utils/dom-helper";
import { closeSocketConn, establishSocketConn } from "../ws/ws.service";
import { tryLoginWithTotp } from "./auth.service";

type AuthState = {
    isAuthenticated: boolean;
    totpRequired: boolean;
    username: string | null;
    displayName: string | null;
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
    const result = await sendApiRequest.get<GetMePayload>(CONST.API.ME);
    if (result.isErr()) return emptyAuthState;

    const { username, displayName } = result.value;
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
    // Replace login form with totp modal if totp is required
    if (state.totpRequired) {
        const el = document.getElementById(CONST.ID.LOGIN_FORM);
        if (!el) return log.error("Fail to find login form: auth store, totpRequired");

        const tokenForm = createTotpTokenForm("login");
        const { statusEl, showErr } = createStatus();
        tokenForm.appendChild(statusEl);
        tokenForm.addEventListener("submit", async (evt) => {
            evt.preventDefault(); // Prevent reload

            const tryLogin = await tryLoginWithTotp();
            if (tryLogin.isErr()) return showErr(tryLogin.error);
        });

        replaceChildren(el, [tokenForm]);
        return;
    }

    // Close socket connection and redirect to default page once logged out
    if (!state.isAuthenticated) {
        closeSocketConn();
        navigateTo(CONST.ROUTE.DEFAULT);
        return;
    }

    establishSocketConn();
});
