import { authState, UserData } from "./../auth/auth.state";

export const showUserStatus = async (container: HTMLElement) => {
    const loggedUser = authState.getUser();

    if (!loggedUser) {
        console.error("No user logged in.");
        return;
    }
    // Create status wrapper
    const statusWrapper = document.createElement("div");
    statusWrapper.className =
        "absolute items-center justify-between bg-gray-100 rounded p-2 shadow-sm right-4 top-4";

    // User display name
    const userNameEl = document.createElement("span");
    userNameEl.textContent = `Logged in as ${loggedUser.username}`;
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
