# The Transcendence Backend

## Usage

### Configurations (as environmental variables)

- BACKEND_PORT: Required, integer from 1024 to 65535, recommended: 3000;
- DB_PATH: Required, path to SQLite file, parent folder must exist (with migration and config for drizzle), recommended: `./drizzle/db.sqlite`.
- API_PREFIX: Optional, default "/api".
- HOST: Optional, default "0.0.0.0".
- DOMAINS: Optional, list of domains separated by space, default "localhost".
- ~~JWT_SECRET~~: Handled by Hashicorp Vault.
