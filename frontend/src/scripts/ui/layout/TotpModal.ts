import { tryLoginWithTotp } from "../../modules/auth/auth.service";

export const createTotpModal = async (): Promise<HTMLElement> => {
    const totpVerifyContainer = document.createElement("div");
    totpVerifyContainer.className =
        "flex flex-col items-center gap-4 bg-white shadow-md rounded p-6";

    const heading = document.createElement("h2");
    heading.textContent = "Enter your TOTP code";
    heading.className = "w-48";

    const tokenInput = document.createElement("input");
    tokenInput.type = "number";
    tokenInput.id = CONST.ID.TOTP_TOKEN;
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

    tokenInput.addEventListener("keypress", (evt) => {
        if (evt.key == "Enter") {
            evt.preventDefault();

            document.getElementById("submit")?.click();
        }
    });

    submitButton.addEventListener("click", tryLoginWithTotp);

    return totpVerifyContainer;
};
