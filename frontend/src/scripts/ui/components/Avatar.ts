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

    // prepare form-data
    const form = new FormData();
    form.append("image", file);

    const res = await sendApiRequest.post<any, { avatarUrl: string }>(CONST.API.AVATAR, form);

    if (res.isErr()) return alert("Upload Fail");
    if (!res.value) return;

    return res.value.avatarUrl;
};

// Mode: Change, profile, stats, etc.
type Opts = {
    src: string;
    tw?: string;
    /** POST endpoint that accepts multipart/form-data and returns { url: string } */
    maxSize?: number; // Default = 5 MB
    onChange?: (url: string) => void; // callback when upload succeeds;
};

export const createAvatar = ({ src, tw = "", onChange }: Opts): HTMLElement => {
    // ----- DOM scaffold -----------------------------------------------------
    const imgEl = createEl(
        "img",
        "w-full h-full object-cover rounded-full cursor-pointer ring-2 ring-transparent hover:ring-blue-400 transition",
        { attributes: { src, alt: getText("USER_AVATAR"), [CONST.ATTR.I18N_ALT]: "USER_AVATAR" } }
    );

    // hidden input (accept images only)
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ALLOWED_TYPES.join(",");
    input.className = "hidden";

    const overlayEl = createEl(
        "div",
        [
            "absolute inset-0 rounded-full bg-black/80",
            "flex items-center justify-center text-white text-lg",
            "opacity-0 transition-opacity duration-150",
            "group-hover:opacity-100 pointer-events-none",
        ].join(" "),
        { text: getText("UPLOAD"), attributes: { [CONST.ATTR.I18N_TEXT]: "UPLOAD" } }
    );

    const ctn = createContainer({
        tw: "relative w-64 h-64 rounded-full group",
        children: [input, overlayEl, imgEl],
    });

    // ----- events -----------------------------------------------------------
    imgEl.addEventListener("click", (e) => {
        e.preventDefault();
        input.click();
    });

    input.addEventListener("change", async (e) => {
        e.preventDefault();

        const file = input.files?.[0];
        if (!file) return;

        const url = await upload(file);
        if (!url) return;

        imgEl.src = `${url}?v=${Date.now()}`; // Cache buster since it's the same name
    });

    return ctn;
};
