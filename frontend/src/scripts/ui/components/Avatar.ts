import { getText } from "../../modules/locale/locale.utils";
import { sendApiRequest } from "../../utils/api";
import { createEl } from "../../utils/dom-helper";
import { createContainer } from "./Container";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const upload = async (file: File): Promise<void | string> => {
    // Client-side validation
    if (!ALLOWED_TYPES.includes(file.type)) return alert("Unsupported error type");
    if (file.size > MAX_SIZE) return alert("File size too large");

    const form = new FormData();
    form.append("image", file);

    const res = await sendApiRequest.post<any, { avatarUrl: string }>(CONST.API.AVATAR, form);

    if (res.isErr()) return alert("Upload Fail");

    return res.value.avatarUrl;
};

// Mode: Change, profile, stats, etc.
type Opts = {
    src: string;
    tw?: string;
    maxSize?: number; // Default = 5 MB
};

export const createAvatar = ({ src, tw = "" }: Opts): HTMLElement => {
    const imgEl = createEl(
        "img",
        "w-1/2 h-1/2 object-cover self-center mx-auto rounded-full cursor-pointer ring-2 ring-transparent hover:ring-blue-400 transition",
        { attributes: { src, alt: getText("USER_AVATAR"), [CONST.ATTR.I18N_ALT]: "USER_AVATAR" } }
    );

    const inputEl = createEl("input", "hidden", {
        attributes: { type: "file", accept: ALLOWED_TYPES.join(",") },
    });

    const overlayEl = createEl(
        "div",
        [
            "absolute inset-0 w-1/2 h-1/2 self-center mx-auto rounded-full bg-black/80",
            "flex items-center justify-center text-white text-lg",
            "opacity-0 transition-opacity duration-150",
            "group-hover:opacity-100 pointer-events-none",
            `${CONST.FONT.BODY_XS}`,
        ].join(" "),
        { text: CONST.TEXT.UPLOAD }
    );

    const ctn = createContainer({
        tw: "relative w-64 h-64 rounded-full group flex",
        children: [inputEl, overlayEl, imgEl],
    });

    imgEl.addEventListener("click", (e) => {
        e.preventDefault();
        inputEl.click();
    });

    inputEl.addEventListener("change", async (e) => {
        e.preventDefault();

        const file = inputEl.files?.[0];
        if (!file) return;

        const url = await upload(file);
        if (!url) return;

        imgEl.src = `${url}?v=${Date.now()}`; // Cache buster since it's the same name
    });

    return ctn;
};
