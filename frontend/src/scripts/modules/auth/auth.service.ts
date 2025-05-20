import type { ErrorCode, LoginBody, LoginPayload, RegisterBody } from "@darrenkuro/pong-core";
import { Result, err, ok } from "neverthrow";
import { navigateTo } from "../../global/router";
import { sendApiRequest } from "../../utils/api";
import { establishSocketConn } from "../ws/ws.service";
import { authStore, emptyAuthState } from "./auth.store";

/**
 * @returns boolean true - success; false - totp required
 */
export const tryLogin = async (payload: LoginBody): Promise<Result<boolean, ErrorCode>> => {
    const res = await sendApiRequest.post<LoginBody, LoginPayload>(CONST.API.LOGIN, payload);
    if (res.isErr()) return err(res.error);

    const data = res.value;

    // Check if user has TOTP enabled first
    if (data.totpEnabled) {
        const { username, password } = payload;
        authStore.update({ totpRequired: true, username, tempAuthString: password });
        return ok(false);
    }

    // TOTP was not enabled and res is successful, user logged in
    const { username, displayName } = data;
    if (!username || !displayName) return err("SERVER_ERROR");

    authStore.set({
        isAuthenticated: true,
        totpRequired: false,
        username,
        displayName,
        tempAuthString: null,
    });

    navigateTo(CONST.ROUTE.HOME);

    return ok(true);
};

export const tryRegister = async (payload: RegisterBody): Promise<Result<void, ErrorCode>> => {
    const res = await sendApiRequest.post<RegisterBody, LoginPayload>(CONST.API.REGISTER, payload);
    if (res.isErr()) return err(res.error);

    const { username, displayName } = res.value;
    if (!username || !displayName) return err("SERVER_ERROR");

    authStore.set({
        isAuthenticated: true,
        totpRequired: false,
        username,
        displayName,
        tempAuthString: null,
    });

    establishSocketConn();
    navigateTo(CONST.ROUTE.HOME);
    return ok();
};

export const tryLoginWithTotp = async (): Promise<Result<void, ErrorCode>> => {
    const { username, tempAuthString } = authStore.get();
    const totpTokenEl = document.getElementById(CONST.ID.TOTP_TOKEN);
    const totpToken = (totpTokenEl as HTMLInputElement)?.value;
    if (!username || !tempAuthString || !totpTokenEl || !totpToken) {
        return err("UNKNOWN_ERROR");
    }

    const res = await sendApiRequest.post<LoginBody, LoginPayload>(CONST.API.LOGIN, {
        username,
        password: tempAuthString,
        totpToken,
    });

    if (res.isErr()) return err(res.error);

    const { displayName } = res.value;
    if (!displayName) return err("SERVER_ERROR");

    authStore.set({
        isAuthenticated: true,
        totpRequired: false,
        username,
        displayName,
        tempAuthString: null,
    });
    navigateTo(CONST.ROUTE.HOME);
    return ok();
};

export const logout = () => {
    log.debug("Logging out...");

    // Remove cookies
    sendApiRequest.post(CONST.API.LOGOUT);
    authStore.set(emptyAuthState);
};
