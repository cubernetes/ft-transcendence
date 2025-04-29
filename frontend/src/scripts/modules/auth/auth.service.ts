import type { LoginBody, LoginResponse, RegisterBody } from "@darrenkuro/pong-core";
import { Result, err, ok } from "neverthrow";
import { sendApiRequest } from "../../utils/api";
import { authStore, emptyAuthState } from "./auth.store";

/**
 * @returns boolean true - success; false - totp required
 */
export const tryLogin = async (payload: LoginBody): Promise<Result<boolean, Error>> => {
    const result = await sendApiRequest.post<LoginBody, LoginResponse>(
        `${window.cfg.url.user}/login`,
        payload
    );

    if (result.isErr()) {
        return err(result.error);
    }

    // Will never reach this becuase result will return Error when success is off
    // However it is difficult to come up with good type guard or ways to please ts
    // TODO: FIX
    if (!result.value.success) {
        return err(new Error("never"));
    }

    const { data } = result.value;

    if (data.totpEnabled) {
        const { username, password } = payload;
        authStore.update({ totpRequired: true, username, tempAuthString: password });
        return ok(false);
    } else {
        const { username, displayName } = data;
        authStore.set({
            isAuthenticated: true,
            totpRequired: false,
            username,
            displayName,
            tempAuthString: null,
        });
        return ok(true);
    }
};

export const tryRegister = async (payload: RegisterBody): Promise<Result<void, Error>> => {
    const result = await sendApiRequest.post<RegisterBody, LoginResponse>(
        `${window.cfg.url.user}/register`,
        payload
    );

    if (result.isErr()) {
        return err(result.error);
    }

    // Will never reach this becuase result will return Error when success is off
    // However it is difficult to come up with good type guard or ways to please ts
    // TODO: FIX
    if (!result.value.success) {
        return err(new Error("never"));
    }

    const { username, displayName } = result.value.data;
    authStore.set({
        isAuthenticated: true,
        totpRequired: false,
        username,
        displayName,
        tempAuthString: null,
    });
    return ok();
};

export const tryLoginWithTotp = async (): Promise<Result<void, Error>> => {
    const { username, tempAuthString } = authStore.get();
    const totpTokenEl = document.getElementById(window.cfg.id.totpToken);
    const totpToken = (totpTokenEl as HTMLInputElement)?.value;
    if (!username || !tempAuthString || !totpTokenEl || !totpToken) {
        return err(new Error("Fail to get data for totp log in"));
    }

    const result = await sendApiRequest.post<LoginBody, LoginResponse>(
        `${window.cfg.url.user}/login`,
        { username, password: tempAuthString, totpToken }
    );

    if (result.isErr()) {
        return err(result.error);
    }

    // Will never reach this becuase result will return Error when success is off
    // However it is difficult to come up with good type guard or ways to please ts
    // TODO: FIX
    if (!result.value.success) {
        return err(new Error("never"));
    }

    const { displayName } = result.value.data;
    authStore.set({
        isAuthenticated: true,
        totpRequired: false,
        username,
        displayName,
        tempAuthString: null,
    });
    return ok();
};

export const logout = () => {
    window.log.debug("Logging out...");

    // Remove cookies
    sendApiRequest.post(`${window.cfg.url.user}/logout`);
    authStore.set(emptyAuthState);
};
