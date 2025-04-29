import type { LoginBody, RegisterBody } from "@darrenkuro/pong-core";
import { TranslationKey, getText, languageStore } from "../../global/language";
import { navigateTo } from "../../global/router";
import { tryLogin, tryRegister } from "../../modules/auth/auth.service";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";

// TODO:´Language Change button should be visible everywhere - not only in the header (not visible in landing)
export const createLoginForm = async (ctaButton: HTMLElement): Promise<HTMLElement> => {
    const wrapper = createEl("div", "relative max-w-md mx-auto p-6 rounded-lg top-1/3", {
        attributes: { id: window.cfg.id.loginForm },
    });

    // Helper: Create input fields
    const createInput = (type: string, placeholderKey: TranslationKey, autocomplete: string) =>
        createEl("input", "w-full p-2 border border-gray-300 rounded", {
            props: {
                type,
                placeholder: getText(placeholderKey),
                autocomplete,
                required: true,
            },
        });

    // Form fields
    const usernameInput = createInput("text", "username", "username");
    const displayNameInput = createInput("text", "display_name", "given-name");
    const passwordInput = createInput("password", "password", "current-password");
    const confirmPasswordInput = createInput("password", "confirm_password", "current-password");

    const errorMessage = createEl("div", "hidden p-2 bg-red-100 text-red-500 rounded text-sm", {
        attributes: { id: "formError" },
        text: "",
    });

    const submitBtn = createEl("button", "w-full p-2 bg-red-500 text-white rounded", {
        text: getText("login"),
        props: {
            type: "submit",
        },
    });

    const authForm = createEl("form", "space-y-4", {
        props: { noValidate: true },
    });

    const quickplayButton = createButton(
        getText("quickplay"),
        "!px-4 py-2 bg-blue-500 text-white rounded-l-md mt-4 w-full",
        () => navigateTo("quickplay")
    );

    const showError = (message: string) => {
        errorMessage.textContent = message;
        errorMessage.classList.remove("hidden");
    };

    const hideError = () => {
        errorMessage.textContent = "";
        errorMessage.classList.add("hidden");
    };

    const renderFormFields = (mode: "login" | "register") => {
        authForm.innerHTML = "";
        authForm.appendChild(usernameInput);
        if (mode === "register") {
            authForm.appendChild(displayNameInput);
        }
        authForm.appendChild(passwordInput);
        if (mode === "register") {
            authForm.appendChild(confirmPasswordInput);
        }
        authForm.appendChild(errorMessage);
        authForm.appendChild(submitBtn);
        hideError();
    };

    let mode: "login" | "register" = "login";
    renderFormFields(mode);

    const updateToggleButtons = () => {
        loginBtn.className =
            mode === "login"
                ? "px-4 py-2 bg-red-500 text-white rounded-l-md"
                : "px-4 py-2 bg-gray-300 rounded-l-md";
        registerBtn.className =
            mode === "login"
                ? "px-4 py-2 bg-gray-300 rounded-r-md"
                : "px-4 py-2 bg-red-500 text-white rounded-r-md";
        submitBtn.textContent = getText(mode === "login" ? "login" : "register");
    };

    const exitButton = createEl(
        "button",
        "absolute top-2 right-6 text-red-600 text-2xl font-bold cursor-pointer",
        {
            props: { innerHTML: "&times;" },
            events: {
                click: () => wrapper.replaceWith(ctaButton),
            },
        }
    );

    const loginBtn = createEl("button", "px-4 py-2 bg-red-500 text-white rounded-l-md", {
        text: getText("login"),
        events: {
            click: () => {
                mode = "login";
                renderFormFields(mode);
                updateToggleButtons();
            },
        },
    });

    const registerBtn = createEl("button", "px-4 py-2 bg-gray-300 rounded-r-md", {
        text: getText("register"),
        events: {
            click: () => {
                mode = "register";
                renderFormFields(mode);
                updateToggleButtons();
            },
        },
    });

    const toggleContainer = createEl("div", "flex justify-center mb-4", {
        children: [loginBtn, registerBtn],
    });

    authForm.addEventListener("submit", async (evt) => {
        evt.preventDefault();
        const formData: Partial<RegisterBody> = {
            username: usernameInput.value,
            password: passwordInput.value,
        };
        if (mode === "register") {
            formData.displayName = displayNameInput.value;
            formData.confirmPassword = confirmPasswordInput.value;
            // TODO: Check on frontend? Backend? Both?
            if (formData.password !== formData.confirmPassword) {
                showError(getText("passw_not_match"));
                return;
            }
        }

        const result =
            mode === "login"
                ? await tryLogin(formData as LoginBody)
                : await tryRegister(formData as RegisterBody);

        if (result.isErr()) {
            window.log.debug(`Failed to ${mode}: ${result.error.message}`);
            showError(getText(mode === "login" ? "login_failed" : "register_failed"));
        }
    });

    appendChildren(wrapper, [exitButton, toggleContainer, authForm, quickplayButton]);

    // Subscribe to language changes
    const unsubscribe = languageStore.subscribe(() => {
        usernameInput.placeholder = getText("username");
        displayNameInput.placeholder = getText("display_name");
        passwordInput.placeholder = getText("password");
        confirmPasswordInput.placeholder = getText("confirm_password");
        submitBtn.textContent = mode === "login" ? getText("login") : getText("register");
        loginBtn.textContent = getText("login");
        registerBtn.textContent = getText("register");
        quickplayButton.textContent = getText("quickplay");
    });

    wrapper.addEventListener("destroy", () => {
        unsubscribe();
    });

    return wrapper;
};
