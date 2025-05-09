import type { ErrorCode, LoginBody, LoginResponse, RegisterBody } from "@darrenkuro/pong-core";
import { Result, err, ok } from "neverthrow";
import { sendApiRequest } from "../../utils/api";
import { authStore, emptyAuthState } from "./auth.store";

/**
 * @returns boolean true - success; false - totp required
 */
export const tryLogin = async (payload: LoginBody): Promise<Result<boolean, ErrorCode>> => {
    const result = await sendApiRequest.post<LoginBody, LoginResponse>(
        `${CONST.API.USER}/login`,
        payload
    );

    if (result.isErr()) {
        return err(result.error);
    }

    // Will never reach this becuase result will return Error when success is off
    // However it is difficult to come up with good type guard or ways to please ts
    // TODO: FIX
    if (!result.value.success) {
        return err("UNKNOWN_ERROR");
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

export const tryRegister = async (payload: RegisterBody): Promise<Result<void, ErrorCode>> => {
    const result = await sendApiRequest.post<RegisterBody, LoginResponse>(
        `${CONST.API.USER}/register`,
        payload
    );

    if (result.isErr()) return err(result.error);

    // Will never reach this becuase result will return Error when success is off
    // However it is difficult to come up with good type guard or ways to please ts
    // TODO: FIX
    if (!result.value.success) return err("UNKNOWN_ERROR");

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

export const tryLoginWithTotp = async (): Promise<Result<void, ErrorCode>> => {
    const { username, tempAuthString } = authStore.get();
    const totpTokenEl = document.getElementById(CONST.ID.TOTP_TOKEN);
    const totpToken = (totpTokenEl as HTMLInputElement)?.value;
    if (!username || !tempAuthString || !totpTokenEl || !totpToken) {
        return err("UNKNOWN_ERROR");
    }

    const result = await sendApiRequest.post<LoginBody, LoginResponse>(`${CONST.API.USER}/login`, {
        username,
        password: tempAuthString,
        totpToken,
    });

    if (result.isErr()) return err(result.error);

    // Will never reach this becuase result will return Error when success is off
    // However it is difficult to come up with good type guard or ways to please ts
    // TODO: FIX
    if (!result.value.success) return err("UNKNOWN_ERROR");

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
    log.debug("Logging out...");

    // Remove cookies
    sendApiRequest.post(`${CONST.API.USER}/logout`);
    authStore.set(emptyAuthState);
};
