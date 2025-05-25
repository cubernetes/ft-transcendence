import { navigateTo } from "../../global/router";
import { tryLogin, tryRegister } from "../../modules/auth/auth.service";
import { getText } from "../../modules/locale/locale.utils";
import { appendChildren, createEl, replaceChildren } from "../../utils/dom-helper";
import { createArcadeWrapper } from "../components/ArcadeWrapper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createInput } from "../components/Input";
import { createStatus } from "../components/Status";
import { createLanguageButton } from "../layout/LanguageButton";

type AuthMode = "login" | "register";

export const createLoginPage = async (): Promise<UIComponent> => {
    let mode: AuthMode = "login"; // Default to login

    const wrapper = createEl("div", "relative mx-auto p-6 rounded-lg", {
        attributes: { id: CONST.ID.LOGIN_FORM },
    });

    // Create input elements
    const { USERNAME, DISPLAY_NAME, PASSWORD, CONFIRM_PASSWORD, LOGIN, REGISTER } = CONST.TEXT;
    const usernameEl = createInput({ ph: USERNAME, ac: "username" });
    const displayNameEl = createInput({ ph: DISPLAY_NAME, ac: "given-name" });
    const passwordEl = createInput({ ph: PASSWORD, type: "password", ac: "current-password" });
    const confirmEl = createInput({
        type: "password",
        ph: CONFIRM_PASSWORD,
        ac: "current-password", // or update
    });

    // Create submit button
    const submitBtn = createButton({
        type: "submit",
        text: mode === "login" ? LOGIN : REGISTER,
        tw: `w-full ${CONST.FONT.BODY_XS} px-4 py-2 bg-red-500 text-white`,
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

        const i18nKey = mode === "login" ? LOGIN : REGISTER;
        // Update submit button text and i18n attr
        submitBtn.textContent = getText(i18nKey);
        submitBtn.setAttribute(CONST.ATTR.I18N_TEXT, i18nKey);

        // TODO: think about this, maybe use hidden and not empty and reappend
        replaceChildren(authForm, modeMap[mode]);
        hideStatus();
    };

    const modeBtnGrp = createButtonGroup({
        texts: [LOGIN, REGISTER],
        cbs: [() => changeMode("login"), () => changeMode("register")],
        twBtnSpecific: ["rounded-l-md", "rounded-r-md"],
        twSelected: "bg-red-500 text-white",
        twBtn: `${CONST.FONT.BODY_XS} px-4 py-2 bg-gray-300 rounded-none`,
        twCtn: "justify-center mb-4",
        defaultSelected: 0,
    });

    // Submit listern will also take in enter
    authForm.addEventListener("submit", async (evt) => {
        evt.preventDefault(); // Prevent reload

        if (mode === "login") {
            const data = { username: usernameEl.value, password: passwordEl.value };
            const res = await tryLogin(data);

            if (res.isErr()) return showErr(res.error);
        } else {
            if (passwordEl.value !== confirmEl.value)
                return showErr(CONST.TEXT.PASSWORD_MATCH_ERROR);

            const data = {
                username: usernameEl.value,
                displayName: displayNameEl.value,
                password: passwordEl.value,
                confirmPassword: confirmEl.value,
            };
            const res = await tryRegister(data);

            if (res.isErr()) return showErr(res.error);
        }
    });

    const quickplayBtn = createButton({
        text: CONST.TEXT.QUICKPLAY,
        tw: `${CONST.FONT.BODY_XS} w-full px-4 py-2 bg-blue-500 text-white mt-4 rounded`,
        click: () => navigateTo(CONST.ROUTE.QUICKPLAY),
    });

    const langBtn = createLanguageButton("absolute top-6 right-0 z-50");
    appendChildren(wrapper, [modeBtnGrp, authForm, quickplayBtn]);
    return createArcadeWrapper([langBtn, wrapper]);
};
