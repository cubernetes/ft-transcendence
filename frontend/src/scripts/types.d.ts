/** Mark file as a module */
export {};

declare global {
    const process: {
        env: {
            WATCH: "1" | "0";
            NODE_ENV: "development" | "production";
        };
    };

    interface Window {
        ethereum?: any; // TODO: shouldn't use any if it can be helped?
    }
}
