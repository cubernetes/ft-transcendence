import { USER_URL } from "../config";
import { logger } from "../utils/logger";

export type AuthFormData = {
    username: string;
    password: string;
    displayName?: string;
    confirmPassword?: string;
};
export const createLoginForm = async (): Promise<HTMLElement> => {
    const wrapper = document.createElement("div");
    wrapper.className = "max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg";

    const toggleContainer = document.createElement("div");
    toggleContainer.className = "flex justify-center mb-4";

    const loginBtn = document.createElement("button");
    loginBtn.className = "px-4 py-2 bg-blue-500 text-white rounded-l-md";
    loginBtn.textContent = "Login";

    const registerBtn = document.createElement("button");
    registerBtn.className = "px-4 py-2 bg-gray-300 rounded-r-md";
    registerBtn.textContent = "Register";

    toggleContainer.append(loginBtn, registerBtn);

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
    submitBtn.className = "w-full p-2 bg-blue-500 text-white rounded";
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
            loginBtn.className = "px-4 py-2 bg-blue-500 text-white rounded-l-md";
            registerBtn.className = "px-4 py-2 bg-gray-300 rounded-r-md";
            submitBtn.textContent = "Login";
        } else {
            registerBtn.className = "px-4 py-2 bg-blue-500 text-white rounded-r-md";
            loginBtn.className = "px-4 py-2 bg-gray-300 rounded-l-md";
            submitBtn.textContent = "Register";
        }
    };

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

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch(`${USER_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                // Show different messages for different error codes
                logger.info(response);
                showError(result.message || "Login failed");
                return;
            }

            localStorage.setItem("token", result.data.token); // Store JWT
            window.location.href = "/"; // Redirect to home page
        } catch (error) {
            // Handle fetch errors or thrown errors
            throw error;
        }
    };

    const register = async (data: AuthFormData) => {
        const response = await fetch(`${USER_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            const { error } = result;
            showError(error.message || "Login failed");
            return;
        }

        localStorage.setItem("token", result.data.token); // Store JWT
        window.location.href = "/"; // Redirect to home page
    };

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
            await login(formData.username, formData.password);
        } else {
            await register(formData);
        }
    });

    wrapper.append(toggleContainer, authForm);

    return wrapper;
};

export class AuthComponent {
    async login(data: AuthFormData) {
        logger.info("Logging in", data);
    }

    async register(data: AuthFormData) {
        logger.info("Registering", data);
    }
}
