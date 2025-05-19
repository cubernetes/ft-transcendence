import { DisplayNameBody, PasswordBody } from "@darrenkuro/pong-core";
import { authStore } from "../../modules/auth/auth.store";
import { sendApiRequest } from "../../utils/api";
import { createButton } from "../components/Button";
import { createContainer } from "../components/Container";
import { createInput } from "../components/Input";
import { createModal } from "../components/Modal";
import { createStatus } from "../components/Status";

type Mode = "password" | "displayName";

export const createUpdateModal = (mode: Mode): void => {
    const { NEW_PASSWORD, OLD_PASSWORD, CONFIRM_PASSWORD, DISPLAY_NAME } = CONST.TEXT;
    const { statusEl, showErr } = createStatus();

    const children = [statusEl];

    const tw = "mt-4 w-1/2";
    const inputOldEl = createInput({ ph: OLD_PASSWORD, tw, type: "password" });
    const inputNewEl = createInput({ ph: NEW_PASSWORD, tw, type: "password" });
    const inputConfirmEl = createInput({ ph: CONFIRM_PASSWORD, tw, type: "password" });
    const inputDisplayNameEl = createInput({ ph: DISPLAY_NAME, tw, type: "password" });

    if (mode === "password") {
        children.unshift(...[inputOldEl, inputNewEl, inputConfirmEl]);
    } else if (mode === "displayName") {
        children.unshift(inputDisplayNameEl);
    }

    const submitBtn = createButton({
        text: CONST.TEXT.SUBMIT,
        type: "submit",
        tw: "w-64 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mx-2 mt-4",
        click: async () => {
            if (mode === "password") {
                const res = await sendApiRequest.post<PasswordBody, {}>(CONST.API.PASSWORD, {
                    oldPassword: inputOldEl.value,
                    newPassword: inputNewEl.value,
                    confirmPassword: inputConfirmEl.value,
                });
                if (res.isErr()) return showErr(res.error);
            } else if (mode === "displayName") {
                const displayName = inputDisplayNameEl.value;
                const res = await sendApiRequest.post<DisplayNameBody, {}>(CONST.API.DISPLAYNAME, {
                    displayName,
                });
                if (res.isErr()) return showErr(res.error);

                authStore.update({ displayName });
            }

            closeModal();
        },
    });

    children.push(submitBtn);

    const container = createContainer({
        tw: "items-center flex flex-col justify-center mx-auto",
        children,
    });

    const closeModal = createModal({ children: [container] });
};
