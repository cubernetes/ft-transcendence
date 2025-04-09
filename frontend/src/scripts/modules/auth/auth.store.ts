import { createStore } from "../../global/store";
import { createTotpModal } from "../../ui/layout/TotpModal";
import { getWrapper } from "../../utils/api";

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

export const authStore = createStore<AuthState>(emptyAuthState);

initAuthState().then((initialState) => {
    authStore.set(initialState);
});

authStore.subscribe(async (state) => {
    window.log.debug("AuthStore subscriber trigged");

    // Redirect to home once successfully authenticated
    if (state.isAuthenticated) {
        window.location.href = window.cfg.url.home;
    }

    // Redirect to default page once logged out
    if (!state.isAuthenticated) {
        window.location.href = window.cfg.url.default;
    }

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
    }
});
