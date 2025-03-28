const API_BASE_URL = "/api";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    id: string;
    username: string;
    displayName: string; // Adjust according to your backend JWT payload
    exp: number;
}

export const showUserLogin = async (): Promise<HTMLElement> => {
    const container = document.createElement("div");
    container.className = "flex flex-col space-y-4 bg-white p-6 rounded shadow-lg";

    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.placeholder = "Username";
    usernameInput.className = "border p-2 rounded";

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Password";
    passwordInput.className = "border p-2 rounded";

    const loginButton = document.createElement("button");
    loginButton.textContent = "Login";
    loginButton.className = "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600";

    container.appendChild(usernameInput);
    container.appendChild(passwordInput);
    container.appendChild(loginButton);

    return container;
};

export const showUserStatus = async (container: HTMLElement) => {
    const token = localStorage.getItem("token");
    console.log(token);

    container.innerHTML = ""; // Clear existing content

    if (!token) return;

    let decoded: JwtPayload;

    try {
        decoded = jwtDecode<JwtPayload>(token);
        if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            return;
        }

        // Verify on the backend to see test that it works
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        localStorage.removeItem("token");
        return;
    }

    // Create status wrapper
    const statusWrapper = document.createElement("div");
    statusWrapper.className =
        "absolute items-center justify-between bg-gray-100 rounded p-2 shadow-sm right-4 top-4";

    // User display name
    const userNameEl = document.createElement("span");
    userNameEl.textContent = `Logged in as ${decoded.username}`;
    userNameEl.className = "text-gray-700 text-sm";

    // Logout button
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.className =
        "ml-4 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded focus:outline-none";

    logoutBtn.onclick = () => {
        localStorage.removeItem("token");
        container.innerHTML = ""; // clear the status
        window.location.reload(); // or redirect to login page
    };

    statusWrapper.appendChild(userNameEl);
    statusWrapper.appendChild(logoutBtn);
    container.appendChild(statusWrapper);
};
