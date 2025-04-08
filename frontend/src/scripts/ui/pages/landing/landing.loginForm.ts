import { authState } from "../../../modules/auth/auth.state";
import { AuthFormData } from "../../../modules/auth/auth.types";

export const createLoginForm = async (ctaButton: HTMLElement): Promise<HTMLElement> => {
    const wrapper = document.createElement("div");
    wrapper.className = "relative max-w-md mx-auto p-6 rounded-lg top-1/3 font-medieval";

    const toggleContainer = document.createElement("div");
    toggleContainer.className = "flex justify-center mb-4";

    const loginBtn = document.createElement("button");
    loginBtn.className = "px-4 py-2 bg-red-500 text-white rounded-l-md";
    loginBtn.textContent = "Login";

    const registerBtn = document.createElement("button");
    registerBtn.className = "px-4 py-2 bg-gray-300 rounded-r-md";
    registerBtn.textContent = "Register";

    toggleContainer.append(loginBtn, registerBtn);

    const exitButton = document.createElement("button");
    exitButton.innerHTML = "&times;";
    exitButton.className = "absolute top-2 right-6 text-red-600 text-2xl font-bold cursor-pointer";

    const authForm = document.createElement("form");
    authForm.className = "space-y-4";
    authForm.noValidate = true;

    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.placeholder = "Username";
    usernameInput.autocomplete = "username";
    usernameInput.required = true;
    usernameInput.className = "w-full p-2 border border-gray-300 rounded";

    const displayNameInput = document.createElement("input");
    displayNameInput.type = "text";
    displayNameInput.placeholder = "Display Name";
    displayNameInput.autocomplete = "given-name";
    displayNameInput.required = true;
    displayNameInput.className = "w-full p-2 border border-gray-300 rounded";

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Password";
    passwordInput.autocomplete = "current-password";
    passwordInput.required = true;
    passwordInput.className = "w-full p-2 border border-gray-300 rounded";

    const confirmPasswordInput = document.createElement("input");
    confirmPasswordInput.type = "password";
    confirmPasswordInput.placeholder = "Confirm Password";
    confirmPasswordInput.autocomplete = "current-password"; // This should be new-password but all these will be rewritten so whatever
    confirmPasswordInput.required = true;
    confirmPasswordInput.className = "w-full p-2 border border-gray-300 rounded";

    const errorMessage = document.createElement("div");
    errorMessage.id = "formError";
    errorMessage.className = "hidden p-2 bg-red-100 text-red-500 rounded text-sm";
    errorMessage.textContent = "";

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "w-full p-2 bg-red-500 text-white rounded";
    submitBtn.textContent = "Login";

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

    exitButton.addEventListener("click", () => {
        wrapper.replaceWith(ctaButton);
    });

    loginBtn.addEventListener("click", () => {
        mode = "login";
        renderFormFields(mode);
        updateToggleButtons();
    });

    registerBtn.addEventListener("click", () => {
        mode = "register";
        renderFormFields(mode);
        updateToggleButtons();
    });

    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData: AuthFormData = {
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
            const loginState = await authState.login(formData);

            if (loginState == 1) {
                window.location.href = "#setup";
            } else if (loginState == 2) {
                window.location.href = "#totpVerify";
            } else {
                showError("Login failed");
            }
        } else {
            if (await authState.register(formData)) {
                window.location.href = "#setup";
            } else {
                showError("Register failed");
            }
        }
    });

    wrapper.append(exitButton, toggleContainer, authForm);

    return wrapper;
};
