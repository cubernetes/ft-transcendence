import { Result, err, ok } from "neverthrow";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "@darrenkuro/pong-core";
import { postWithBody } from "../../utils/api";
import { authStore, emptyAuthState } from "./auth.store";
import { AuthFormData } from "./auth.types";

/**
 * Would be business logic, such as api calls etc.
 */
// TODO: move to pong-core
type AuthFormResponse = {
    success: boolean;
    data: {
        token: string;
        totpEnabled: boolean;
    };
};

/** Process JWT token, local storage, authStore update */
const processToken = (token: string) => {
    localStorage.setItem(window.cfg.label.token, token);
    const jwtPayload: JwtPayload = jwtDecode(token); // Failable?
    const { id, username } = jwtPayload;
    authStore.set({ isAuthenticated: true, id, username, token, totpRequired: false });
};

/**
 * @returns boolean true - success; false - totp required
 */
export const tryLogin = async (payload: AuthFormData): Promise<Result<boolean, Error>> => {
    const result = await postWithBody<AuthFormData, AuthFormResponse>(
        `${window.cfg.url.user}/login`,
        payload
    );

    if (result.isErr()) {
        return err(result.error);
    }

    // if (!result.value.success)?

    const { data } = result.value;

    if (data.totpEnabled) {
        const { username } = payload;
        authStore.update({ totpRequired: true, username });
        window.log.debug("TOTP required, authStore should notify");
        return ok(false);
    } else {
        processToken(data.token);
        return ok(true);
    }
};

export const tryRegister = async (payload: AuthFormData): Promise<Result<void, Error>> => {
    const result = await postWithBody<AuthFormData, AuthFormResponse>(
        `${window.cfg.url.user}/register`,
        payload
    );

    if (result.isErr()) {
        return err(result.error);
    }

    // if (!result.value.success)?

    processToken(result.value.data.token);

    return ok();
};

export const tryTotpVerify = async (): Promise<Result<void, Error>> => {
    const { username } = authStore.get();
    const totpTokenEl = document.getElementById(window.cfg.id.totpToken);
    const token = (totpTokenEl as HTMLInputElement)?.value;
    if (!username || !totpTokenEl || !token) {
        return err(new Error("Fail to get username or input element for totp token"));
    }

    const result = await postWithBody<{ username: string; token: string }, AuthFormResponse>(
        `${window.cfg.url.user}/totpVerify`,
        {
            username,
            token,
        }
    );

    if (result.isErr()) {
        const msg = `Fail to POST to totpVerify: ${result.error.message}}`;
        window.log.error(msg);
        return err(new Error(msg));
    }

    // if (!result.value.success)?
    // if (resp.status == 400) {
    //     alert("Invalid request"); // TODO: Remove alerts
    // } else if (resp.status == 401) {
    //     alert("Invalid TOTP code");
    // } else if (resp.status == 404) {
    //     alert(`User '${username}' not found`);

    processToken(result.value.data.token);
    return ok();
};

export const logout = () => {
    window.log.debug("Logging out...");
    const authState = authStore.get();
    if (!authState.isAuthenticated) {
        window.log.warn("Try to log out user when not authenticated");
    }

    authStore.set(emptyAuthState);

    // TODO: access/refresh token maybe; local storage is not safe!
    localStorage.removeItem(window.cfg.label.token);
};
