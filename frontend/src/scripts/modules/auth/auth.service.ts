import type {
    JwtPayload,
    LoginBody,
    LoginResponse,
    RegisterBody,
    TotpBody,
    TotpVerifyResponse,
} from "@darrenkuro/pong-core";
import { Result, err, ok } from "neverthrow";
import { jwtDecode } from "jwt-decode";
import { sendApiRequest } from "../../utils/api";
import { authStore, emptyAuthState } from "./auth.store";

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
        const { username } = payload;
        authStore.update({ totpRequired: true, username });
        window.log.debug("TOTP required, authStore should notify");
        return ok(false);
    } else {
        processToken(data.token);
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

    const result = await sendApiRequest.post<TotpBody, TotpVerifyResponse>(
        `${window.cfg.url.user}/totpVerify`,
        { username, token }
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

    processToken(result.value.data.token);
    return ok();
};

export const logout = () => {
    window.log.debug("Logging out...");

    authStore.set(emptyAuthState);
    localStorage.removeItem(window.cfg.label.token);
};
