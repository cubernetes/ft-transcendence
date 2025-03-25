import { jwtDecode } from "jwt-decode";
import { USER_URL } from "./config";

interface JwtPayload {
    id: string;
    username: string;
    displayName: string; // Adjust according to your backend JWT payload
    exp: number;
}

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
        const response = await fetch(`${USER_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
    } catch (error) {
        localStorage.removeItem("token");
        return;
    }

    // Create status wrapper
    const statusWrapper = document.createElement("div");
    statusWrapper.className = "flex items-center justify-between bg-gray-100 rounded p-2 shadow-sm";

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

export const fetchTestData = async () => {
    try {
        const response = await fetch(`${USER_URL}/leaderboard/10`);
        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        const data = await response.json();

        // Process data into how it's typed on the leaderboard page
        const processedData = data.data
            .map((p: Record<string, any>) => ({
                id: p.id,
                name: p.username,
                wins: p.wins,
                losses: p.losses,
            }))
            .sort((a: Record<string, any>, b: Record<string, any>) => b.wins - a.wins)
            .map((p: Record<string, any>, i: number) => ({
                ...p,
                rank: i + 1,
            }));

        return processedData;
    } catch (error) {
        console.error("Fetch error:", error);

        throw error;
    }
};
