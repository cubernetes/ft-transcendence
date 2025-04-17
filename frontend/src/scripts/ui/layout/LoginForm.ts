import type { LoginBody, RegisterBody } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { tryLogin, tryRegister } from "../../modules/auth/auth.service";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";

export const createLoginForm = async (ctaButton: HTMLElement): Promise<HTMLElement> => {
    const wrapper = createEl("div", "relative max-w-md mx-auto p-6 rounded-lg top-1/3", {
        attributes: { id: window.cfg.id.loginForm },
    });

    const usernameInput = createEl("input", "w-full p-2 border border-gray-300 rounded", {
        props: {
            type: "text",
            placeholder: "Username",
            autocomplete: "username",
            required: true,
        },
    });

    const displayNameInput = createEl("input", "w-full p-2 border border-gray-300 rounded", {
        props: {
            type: "text",
            placeholder: "Display Name",
            autocomplete: "given-name",
            required: true,
        },
    });

    const passwordInput = createEl("input", "w-full p-2 border border-gray-300 rounded", {
        props: {
            type: "password",
            placeholder: "Password",
            autocomplete: "current-password",
            required: true,
        },
    });

    const confirmPasswordInput = createEl("input", "w-full p-2 border border-gray-300 rounded", {
        props: {
            type: "password",
            placeholder: "Confirm Password",
            autocomplete: "current-password", // or new-password if updated
            required: true,
        },
    });

    const errorMessage = createEl("div", "hidden p-2 bg-red-100 text-red-500 rounded text-sm", {
        attributes: { id: "formError" },
        text: "",
    });

    const submitBtn = createEl("button", "w-full p-2 bg-red-500 text-white rounded", {
        text: "Login",
        props: {
            type: "submit",
        },
    });

    const authForm = createEl("form", "space-y-4", {
        props: { noValidate: true },
    });

    const quickplayButton = createButton(
        "Quickplay",
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
        if (mode === "login") {
            loginBtn.className = "px-4 py-2 bg-red-500 text-white rounded-l-md";
            registerBtn.className = "px-4 py-2 bg-gray-300 rounded-r-md";
            submitBtn.textContent = "Login";
        } else {
            registerBtn.className = "px-4 py-2 bg-red-500 text-white rounded-r-md";
            loginBtn.className = "px-4 py-2 bg-gray-300 rounded-l-md";
            submitBtn.textContent = "Register";
        }
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
        text: "Login",
        events: {
            click: () => {
                mode = "login";
                renderFormFields(mode);
                updateToggleButtons();
            },
        },
    });

    const registerBtn = createEl("button", "px-4 py-2 bg-gray-300 rounded-r-md", {
        text: "Register",
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
            // Check on frontend? Backend? Both?
            if (formData.password !== formData.confirmPassword) {
                showError("Passwords do not match!");
                return;
            }
        }

        if (mode === "login") {
            const result = await tryLogin(formData as LoginBody);

            if (result.isErr()) {
                window.log.debug(`Fail to register: ${result.error.message}`);
                showError("Login failed");
                return;
            }
        } else {
            const result = await tryRegister(formData as RegisterBody);
            if (result.isErr()) {
                window.log.debug(`Fail to register: ${result.error.message}`);
                showError("Register failed");
                return;
            }
        }
    });

    appendChildren(wrapper, [exitButton, toggleContainer, authForm, quickplayButton]);

    return wrapper;
};
