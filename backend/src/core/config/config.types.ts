export type AppConfig = {
    port: number;
    jwtSecret: string;
    dbPath: string;
    dbDir: string;
    apiPrefix: string;
    host: string;
    domains: string[];
    corsOrigin: string[] | "*";
};
