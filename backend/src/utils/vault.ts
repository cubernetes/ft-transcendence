import fs from "fs";
import { err, ok, Result } from "neverthrow";

export const readVaultOnce = async (
    path: string
): Promise<Result<{ JWT_SECRET: string }, Error>> => {
    const tokenFile = "/run/secrets/backend_vault_token";
    const vaultToken = fs.readFileSync(tokenFile, "utf8").trim();

    // Clear right away, since not needed anymore, but token-max-use should be set to 1 anyways
    fs.writeFileSync(tokenFile, "");

    const req = await fetch(`http://vault:8200/v1/${path}`, {
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
