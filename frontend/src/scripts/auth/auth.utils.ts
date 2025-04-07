import { authState } from "./auth.state";

export const checkAccess = (): boolean => {
    const user = authState.getUser();
    if (!user) {
        window.location.href = "#landing";
        return false;
    } else if (user.exp * 1000 < Date.now()) {
        authState.logout();
        window.location.href = "#landing";
        return false;
    } else {
        return true;
    }
};
