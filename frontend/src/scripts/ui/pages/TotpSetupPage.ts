import { navigateTo } from "../../global/router";

/**
 * TODO: refactor this into a modal
 */
export const createTotpSetupPage = async (): Promise<HTMLElement[]> => {
    const main = document.createElement("main");
    main.className = "container mx-auto p-4 flex flex-col items-center";

    const totpSetupContainer = document.createElement("div");
    totpSetupContainer.className =
        "flex flex-col items-center gap-4 bg-white shadow-md rounded p-6";

    const [qrCodeData, b32secretData] = await fetchQrCode();

    const qrCode = document.createElement("img");
    qrCode.src = qrCodeData;
    qrCode.alt = "You have to be logged in to set up 2FA";
    qrCode.className = "w-48 h-48";

    const b32secret = document.createElement("span");
    b32secret.textContent = b32secretData;
    b32secret.className = "w-128 p-2 border border-gray-300 rounded text-xs";

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
    totpSetupContainer.appendChild(qrCode);
    totpSetupContainer.appendChild(b32secret);
    totpSetupContainer.appendChild(tokenInput);
    totpSetupContainer.appendChild(submitButton);

    main.appendChild(totpSetupContainer);

    tokenInput.addEventListener("keypress", (evt) => {
        if (evt.key == "Enter") {
            evt.preventDefault();

            document.getElementById("submit")?.click();
        }
    });

    submitButton.addEventListener("click", async () => {
        const username = localStorage.getItem("username") || "";

        const jwt = localStorage.getItem("token");

        if (!jwt) {
            alert("You have to be logged in to set up TOTP");
            return;
        }

        const resp = await fetch(`${window.cfg.url.user}/totpVerifyInitial`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + jwt,
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
                //container.innerHTML = "";
                window.location.reload();
            } else {
                localStorage.setItem("token", jwt);
                navigateTo("setup");
            }
        }
    });

    return [main];
};

const fetchQrCode = async () => {
    const resp = await fetch(`${window.cfg.url.user}/totpSetup`, {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("token") || "Unauthorized",
        },
    });
    try {
        const data = await resp.json();
        return [data?.data?.qrCode, data?.data?.b32secret];
    } catch (error) {
        return ["", ""];
    }
};
