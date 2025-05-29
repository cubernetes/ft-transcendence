import type { CookieConfig, TotpEncodingOption } from "./config.types.ts";

const COOKIE_NAME = "token";
const COOKIE_CONFIG: CookieConfig = {
    path: "/", // Valid for the whole site
    secure: process.env.NODE_ENV === "production", // Send cookie over HTTPS only in production only
    httpOnly: true, // Forbid JavaScript from accessing cookies, prevent XSS
    sameSite: "strict", // alternative CSRF protection
};

const TOTP_ENCODING: TotpEncodingOption = "base32";

const WS_MAX_PAYLOAD = 65536;

const UPLOAD_DIR = "./uploads/";

const UPLOAD_MAX_SIZE = 10 * 1024 * 1024; // 10MB; reject abnormally large file upload for protection

export const CONST = {
    cookieName: COOKIE_NAME,
    cookieConfig: COOKIE_CONFIG,
    totpEncoding: TOTP_ENCODING,
    wsMaxPayload: WS_MAX_PAYLOAD,
    uploadDir: UPLOAD_DIR,
    uploadMaxSize: UPLOAD_MAX_SIZE,
};
