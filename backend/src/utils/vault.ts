import { Result, err, ok } from "neverthrow";
import fs from "fs";

export const readVaultOnce = async (
    path: string
): Promise<
    Result<
        {
            JWT_SECRET: string;
            DB_PATH: string;
            LOGSTASH_PORT: string;
            LOGSTASH_HOSTNAME: string;
            HOST: string;
            API_PREFIX: string;
        },
        Error
    >
> => {
    const tokenFile = "/run/secrets/backend_vault_token";
    const vaultToken = fs.readFileSync(tokenFile, "utf8").trim();

    // Clear token file in production right away
    if (process.env.NODE_ENV === "production") {
        fs.writeFileSync(tokenFile, "");
    }

    const req = await fetch(`http://vault:${process.env.VAULT_API_PORT ?? 8200}/v1/${path}`, {
        headers: { "X-Vault-Token": vaultToken },
    });
    let res;

    try {
        res = await req.json();
    } catch (error) {
        return err(new Error("invalid JSON response"));
    }

    if (!req.ok) {
        return err(new Error(`API request failed: ${res.errors?.[0] ?? "unknown error"}`));
    }

    if (!res.data?.data?.JWT_SECRET) {
        return err(new Error("missing JWT_SECRET in response"));
    }

    return ok(res.data.data);
};
