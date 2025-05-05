import { navigateTo } from "../../global/router";
import { tryLogin, tryRegister } from "../../modules/auth/auth.service";
import { getText } from "../../modules/locale/locale.utils";
import { appendChildren, createEl, replaceChildren } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createInput } from "../components/Input";
import { createStatus } from "../components/Status";

type AuthMode = "login" | "register";
const DEFAULT_MODE = "login";

// TODO:´Language Change button should be visible everywhere - not only in the header (not visible in landing)
export const createLoginForm = async (ctaButton: HTMLButtonElement): Promise<HTMLElement[]> => {
    let mode: AuthMode = DEFAULT_MODE;

    const wrapper = createEl("div", "relative max-w-md mx-auto p-6 rounded-lg top-1/3", {
        attributes: { id: CONST.ID.LOGIN_FORM },
    });

    const exitBtn = createEl(
        "button",
        "absolute top-2 right-6 text-red-600 text-2xl font-bold cursor-pointer",
        {
            props: { innerHTML: "&times;" },
            events: {
                click: () => wrapper.replaceWith(ctaButton),
            },
        }
    );

    // Create input elements
    const usernameEl = createInput({ ph: "username", ac: "username" });
    const displayNameEl = createInput({ ph: "display_name", ac: "given-name" });
    const passwordEl = createInput({ type: "password", ph: "password", ac: "current-password" });
    const confirmEl = createInput({
        type: "password",
        ph: "confirm_password",
        ac: "current-password", // or update
    });

    // Create submit button
    const submitBtn = createButton({
        type: "submit",
        text: mode,
        tw: "w-full bg-red-500 text-white",
    });

    // Create status component
    const { statusEl, showErr, hideStatus } = createStatus();

    // Map elements by mode
    const modeMap = {
        login: [usernameEl, passwordEl, statusEl, submitBtn],
        register: [usernameEl, displayNameEl, passwordEl, confirmEl, statusEl, submitBtn],
    } satisfies Record<AuthMode, HTMLElement[]>;

    const authForm = createEl("form", "space-y-4", {
        props: { noValidate: true }, // Handle validation manually
        children: modeMap[mode],
    });

    const changeMode = (newMode: "login" | "register") => {
        mode = newMode;

        // Update submit button text and i18n attr
        submitBtn.textContent = getText(mode);
        submitBtn.setAttribute(CONST.ATTR.I18N_TEXT, mode);

        // TODO: think about this, maybe use hidden and not empty and reappend
        replaceChildren(authForm, modeMap[mode]);
        hideStatus();
    };

    const modeBtnGrp = createButtonGroup({
        texts: ["login", "register"],
        cbs: [() => changeMode("login"), () => changeMode("register")],
        twBtnSpecific: ["rounded-l-md", "rounded-r-md"],
        twSelected: "bg-red-500 text-white",
        twBtn: "px-4 py-2 bg-gray-300 rounded-none",
        twCtn: "justify-center mb-4",
        defaultSelected: 0,
    });

    // Submit listern will also take in enter
    authForm.addEventListener("submit", async (evt) => {
        // Prevent reload and clear from default
        evt.preventDefault();

        if (mode === "login") {
            const data = { username: usernameEl.value, password: passwordEl.value };
            const result = await tryLogin(data);

            // TODO handle base on what's the error
            if (result.isErr()) return showErr("login_failed");
        } else {
            // TODO: maybe only let backend check this
            if (passwordEl.value !== confirmEl.value) return showErr("passw_not_match");

            const data = {
                username: usernameEl.value,
                displayName: displayNameEl.value,
                password: passwordEl.value,
                confirmPassword: confirmEl.value,
            };
            const result = await tryRegister(data);

            // TODO handle base on what's the error
            if (result.isErr()) return showErr("register_failed");
        }
    });

    const quickplayBtn = createButton({
        text: "quickplay",
        tw: "w-full px-4 py-2 bg-blue-500 text-white rounded-l-md mt-4",
        click: () => navigateTo("quickplay"),
    });

    appendChildren(wrapper, [exitBtn, modeBtnGrp, authForm, quickplayBtn]);

    return [wrapper];
};
