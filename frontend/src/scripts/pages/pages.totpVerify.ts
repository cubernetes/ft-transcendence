import { createFooter } from "../components/components.footer";
import { createHeader } from "../components/components.header";
import { API_URL } from "../config";

export const createTotpVerifyPage = async (): Promise<HTMLElement> => {
    const fragment = document.createDocumentFragment();

    const header = await createHeader();

    const main = document.createElement("main");
    main.className = "container mx-auto p-4 flex flex-col items-center";

    const totpVerifyContainer = document.createElement("div");
    totpVerifyContainer.className =
        "flex flex-col items-center gap-4 bg-white shadow-md rounded p-6";

    const heading = document.createElement("h2");
    heading.textContent = "Enter your TOTP code";
    heading.className = "w-48";

    const tokenInput = document.createElement("input");
    tokenInput.type = "number";
    tokenInput.id = "totpToken";
    tokenInput.required = true;
    tokenInput.placeholder = "Enter TOTP code";
    tokenInput.className = "w-64 p-2 border border-gray-300 rounded";

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.id = "submit";
    submitButton.className =
        "w-64 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded";

    // Append all to container
    totpVerifyContainer.appendChild(heading);
    totpVerifyContainer.appendChild(tokenInput);
    totpVerifyContainer.appendChild(submitButton);

    main.appendChild(totpVerifyContainer);

    const footer = await createFooter();

    fragment.appendChild(header);
    fragment.appendChild(main);
    fragment.appendChild(footer);

    const container = document.createElement("div");
    container.appendChild(fragment);

    tokenInput.addEventListener("keypress", (event) => {
        if (event.key == "Enter") {
            event.preventDefault();

            document.getElementById("submit")?.click();
        }
    });

    submitButton.addEventListener("click", async () => {
        const username = localStorage.getItem("username") || "";

        const resp = await fetch(`${API_URL}/user/totpVerify`, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                username,
                token: (document.getElementById("totpToken") as HTMLInputElement)?.value,
            }),
        });

        if (resp.status == 400) {
            alert("Invalid request"); // TODO: Remove alerts
        } else if (resp.status == 401) {
            alert("Invalid TOTP code");
        } else if (resp.status == 404) {
            alert(`User '${username}' not found`);
        } else {
            const data = await resp.json();
            const jwt = data.data.token;
            if (!jwt) {
                alert("Invalid response from server (JWT missing). Logging out");
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                container.innerHTML = "";
                window.location.reload();
            } else {
                localStorage.setItem("token", jwt);
                window.location.href = "/";
            }
        }
    });

    return container;
};
