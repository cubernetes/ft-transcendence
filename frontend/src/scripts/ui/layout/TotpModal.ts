import { TotpSetupPayload } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { sendApiRequest } from "../../utils/api";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createButton, createCopyButton } from "../components/Button";
import { createContainer } from "../components/Container";
import { createHeading } from "../components/Heading";
import { createInput } from "../components/Input";
import { createModal } from "../components/Modal";
import { createParagraph } from "../components/Paragraph";
import { createStatus } from "../components/Status";

type Mode = "login" | "disable" | "setup" | "update";

const fetchQrCode = async () => {
    const resp = await sendApiRequest.get<TotpSetupPayload>(CONST.API.SETUP_2FA);

    if (resp.isErr()) return ["", ""];

    const { qrCode, secret } = resp.value;
    return [qrCode, secret];
};

export const createTotpTokenForm = (mode: Mode): HTMLElement => {
    const titleEl = createHeading({ text: "Enter your TOTP code", tw: "text-2xl" });

    const tokenInput = createInput({
        type: "text",
        ph: CONST.TEXT.ENTER_TOTP_CODE,
        id: CONST.ID.TOTP_TOKEN,
        tw: "w-64 p-2 border border-gray-300 rounded",
        ac: "off",
    });

    const newTokenInput = createInput({
        type: "text",
        ph: CONST.TEXT.ENTER_TOTP_CODE_NEW,
        id: CONST.ID.TOTP_NEW_TOKEN,
        tw: "w-64 p-2 border border-gray-300 rounded mx-2",
        ac: "off",
    });

    const submitBtn = createButton({
        text: CONST.TEXT.SUBMIT,
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
    const { statusEl, showErr } = createStatus();
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

        const copyBtn = createCopyButton(b32secretData);

        appendChildren(container, [qrCodeImg, b32secretP, copyBtn]);
    }

    const tokenForm = createTotpTokenForm(mode);

    container.appendChild(tokenForm);
    const closeModal = createModal({ children: [container] });

    tokenForm.addEventListener("submit", async (evt) => {
        evt.preventDefault(); // Prevent reload

        const successEl = createParagraph({
            text: CONST.TEXT.SUCCESS,
            tw: "text-white bg-green-600",
        });
        const timeoutMs = 2000;
        switch (mode) {
            case "disable":
                const tryDisable = await sendApiRequest.post(CONST.API.DISABLE_2FA, {
                    token: (document.getElementById(CONST.ID.TOTP_TOKEN) as HTMLInputElement).value,
                });
                if (tryDisable.isErr()) return showErr(tryDisable.error);

                closeModal();
                createModal({
                    children: [successEl],
                    tw: "bg-green-600",
                    exitable: false,
                });
                return setTimeout(() => navigateTo(CONST.ROUTE.PROFILE, true), timeoutMs);
            case "setup":
                const trySetup = await sendApiRequest.post(CONST.API.VERIFY_2FA, {
                    token: (document.getElementById(CONST.ID.TOTP_NEW_TOKEN) as HTMLInputElement)
                        .value,
                });

                if (trySetup.isErr()) return showErr(trySetup.error);

                closeModal();
                createModal({
                    children: [successEl],
                    tw: "bg-green-600",
                    exitable: false,
                });
                return setTimeout(() => navigateTo(CONST.ROUTE.PROFILE, true), timeoutMs);
            case "update":
                const tryUpdate = await sendApiRequest.post(CONST.API.UPDATE_2FA, {
                    token: (document.getElementById(CONST.ID.TOTP_TOKEN) as HTMLInputElement).value,
                    newToken: (document.getElementById(CONST.ID.TOTP_NEW_TOKEN) as HTMLInputElement)
                        .value,
                });
                if (tryUpdate.isErr()) return showErr(tryUpdate.error);

                closeModal();
                createModal({
                    children: [successEl],
                    tw: "bg-green-600",
                    exitable: false,
                });
                return setTimeout(() => navigateTo(CONST.ROUTE.PROFILE, true), timeoutMs);
        }
    });
};
