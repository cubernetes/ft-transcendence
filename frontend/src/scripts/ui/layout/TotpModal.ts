import { TotpSetupResponse } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { sendApiRequest } from "../../utils/api";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createContainer } from "../components/Container";
import { createInput } from "../components/Input";
import { createModal } from "../components/Modal";
import { createParagraph } from "../components/Paragraph";
import { createStatus } from "../components/Status";
import { createTitle } from "../components/Title";

type Mode = "login" | "disable" | "setup" | "update";

const fetchQrCode = async () => {
    const resp = await sendApiRequest.get<TotpSetupResponse>(`${CONST.API.TOTP}/setup`);

    if (resp.isErr() || !resp.value.success) {
        // TODO: IF fail, api error el
        return ["", ""];
    }

    const { qrCode, secret } = resp.value.data;
    return [qrCode, secret];
};

export const createTotpTokenForm = (mode: Mode): HTMLElement => {
    const titleEl = createTitle({ text: "Enter your TOTP code", tw: "text-2xl" });

    const tokenInput = createInput({
        type: "text",
        ph: "Enter TOTP code",
        id: CONST.ID.TOTP_TOKEN,
        tw: "w-64 p-2 border border-gray-300 rounded",
        ac: "off",
    });

    const newTokenInput = createInput({
        type: "text",
        ph: "Enter TOTP code for new secret",
        id: CONST.ID.TOTP_NEW_TOKEN,
        tw: "w-64 p-2 border border-gray-300 rounded mx-2",
        ac: "off",
    });

    const submitBtn = createButton({
        text: "submit",
        type: "submit",
        tw: "w-64 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mx-2",
    });

    const children =
        mode === "login" || mode === "disable"
            ? [titleEl, tokenInput, submitBtn]
            : mode === "setup"
              ? [newTokenInput, submitBtn]
              : [tokenInput, newTokenInput, submitBtn];

    const tokenForm = createEl(
        "form",
        "bg-white shadow-md rounded p-6 items-center space-y-4 flex-col mx-auto",
        {
            props: { noValidate: true }, // Handle validation manually
            children,
        }
    );

    return tokenForm;
};

export const createTotpModal = async (mode: Exclude<Mode, "login">): Promise<void> => {
    const container = createContainer({ tw: "items-center flex-col mx-auto" });
    const { statusEl, showErr } = createStatus({});
    container.appendChild(statusEl);

    if (mode === "update" || mode === "setup") {
        const [qrCodeData, b32secretData] = await fetchQrCode();

        const qrCodeImg = createEl("img", "w-48 h-48 mx-auto", {
            props: { src: qrCodeData, alt: "You have to be logged in to set up 2FA" },
        });

        const b32secretP = createParagraph({
            text: b32secretData,
            tw: "w-128 p-2 border border-gray-300 rounded text-xs",
        });

        appendChildren(container, [qrCodeImg, b32secretP]);
    }

    const tokenForm = createTotpTokenForm(mode);

    container.appendChild(tokenForm);
    const closeModal = createModal({ children: [container] });

    tokenForm.addEventListener("submit", async (evt) => {
        // Prevent reload and clear from default
        evt.preventDefault();

        switch (mode) {
            case "disable":
                const tryDisable = await sendApiRequest.post(`${CONST.API.TOTP}/disable`, {
                    token: (document.getElementById(CONST.ID.TOTP_TOKEN) as HTMLInputElement).value,
                });
                if (tryDisable.isErr()) return showErr(tryDisable.error);

                return closeModal();
            case "setup":
                const trySetup = await sendApiRequest.post(`${CONST.API.TOTP}/verify`, {
                    token: (document.getElementById(CONST.ID.TOTP_NEW_TOKEN) as HTMLInputElement)
                        .value,
                });

                if (trySetup.isErr()) return showErr(trySetup.error);
                navigateTo(CONST.ROUTE.HOME);

                return closeModal();
            case "update":
                const tryUpdate = await sendApiRequest.post(`${CONST.API.TOTP}/verify`, {
                    token: (document.getElementById(CONST.ID.TOTP_TOKEN) as HTMLInputElement).value,
                    newToken: (document.getElementById(CONST.ID.TOTP_NEW_TOKEN) as HTMLInputElement)
                        .value,
                });
                if (tryUpdate.isErr()) return showErr(tryUpdate.error);

                return closeModal();
        }
    });
};

// TODO: move handler to module probably auth
