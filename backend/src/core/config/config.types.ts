export type TotpEncodingOption = "ascii" | "hex" | "base32";

export type CookieConfig = {
    path: string;
    secure: boolean;
    httpOnly: boolean;
    sameSite: boolean | "strict" | "lax" | "none";
};

export type AppConfig = {
    port: number;
    jwtSecret: string;
    dbPath: string;
    dbDir: string;
    apiPrefix: string;
    host: string;
    domains: string[];
    corsOrigin: string[] | "*";
    cookieName: string;
    cookieConfig: CookieConfig;
    totpEncoding: TotpEncodingOption;
    wsMaxPayload: number;
    uploadDir: string;
    uploadMaxSize: number;
};
