// TODO: Figure out the correct setting for cookies
export type CookieConfig = {
    domain?: "your.domain";
    path: string;
    secure?: boolean; // send cookie over HTTPS only
    httpOnly: boolean;
    sameSite?: boolean; // alternative CSRF protection
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
    totpEncoding: "ascii" | "hex" | "base32";
};
