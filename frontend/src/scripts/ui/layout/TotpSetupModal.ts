import { TotpSetupResponse } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { sendApiRequest } from "../../utils/api";
import { createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createContainer } from "../components/Container";
import { createInput } from "../components/Input";
import { createModal } from "../components/Modal";
import { createParagraph } from "../components/Paragraph";

const fetchQrCode = async () => {
    const resp = await sendApiRequest.get<TotpSetupResponse>(`${CONST.API.TOTP}/setup`);

    if (resp.isErr() || !resp.value.success) {
        // TODO: IF fail, api error el
        return ["", ""];
    }

    const { qrCode, secret } = resp.value.data;
    return [qrCode, secret];
};

export const createTotpSetupModal = async (): Promise<void> => {
    const [qrCodeData, b32secretData] = await fetchQrCode();

    const qrCodeImg = createEl("img", "w-48 h-48", {
        props: { src: qrCodeData, alt: "You have to be logged in to set up 2FA" },
    });

    const b32secretP = createParagraph({
        text: b32secretData,
        tw: "w-128 p-2 border border-gray-300 rounded text-xs",
    });

    const tokenInput = createInput({
        type: "text",
        ph: "Enter TOTP code",
        tw: "w-64 p-2 border border-gray-300 rounded",
    });

    const submitBtn = createButton({
        text: "submit",
        type: "submit",
        tw: "w-64 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded",
    });

    const tokenForm = createEl("form", "space-y-4 flex flex-col mx-auto", {
        props: { noValidate: true }, // Handle validation manually
        children: [tokenInput, submitBtn],
    });

    tokenForm.addEventListener("submit", async (evt) => {
        // Prevent reload and clear from default
        evt.preventDefault();

        // TODO: Backend is ok to handle this,
        // const { isAuthenticated } = authStore.get();
        // if (!isAuthenticated) return log.warn("You have to be logged in to set up TOTP");
        log.debug(tokenInput.value);
        const result = await sendApiRequest.post(`${CONST.API.TOTP}/verify`, {
            token: tokenInput.value,
        });

        if (result.isErr()) return; // TODO: handle specfic error differently?

        navigateTo(CONST.ROUTE.HOME);
        // if (resp.status == 400) {
        //     alert("Invalid request"); // TODO: Remove alerts
        // } else if (resp.status == 401) {
        //     alert("Invalid TOTP code");
        // } else if (resp.status == 404) {
        //     alert(`User ${username} not found`);
        // } else {
        // const data = resp.value;
        // const jwt = data.data.token;
        // if (!jwt) {
        //     alert("Invalid response from server (JWT missing). Logging out");
        //     localStorage.removeItem("token");
        //     localStorage.removeItem("username");
        //     //container.innerHTML = "";
        //     window.location.reload();
        // } else {
        //     localStorage.setItem("token", jwt);
        //     navigateTo("setup");
        // }
        //}
    });

    createModal([qrCodeImg, b32secretP, tokenForm]);
};
