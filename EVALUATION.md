# Evaluation Roadmap

## Ensure clean environment

- `make deepclean` (everything, +docker, very aggressive)
- `make vclean` (volumes, usually sufficient)
- `make clean` (like `vclean`, but also delete `node_modules` and other files)

## Preparation for vault (for demonstration later)

- change `SAVE_ROOT_TOKEN` and `SAVE_UNSEAL_KEYS` in env.json to `"0"`

## Preparation for online game:

- change env.json -> DEV_DOMAINS to include domain of computer (c4c2c5.42berlin.de, etc.)

## Build

- `make` (development mode)
- `make dev-elk` (development with ELK, slower startup)
- `make prod` (caddy tries ACME for https, privileged ports, etc.)
- `make wait` (in another terminal, only used in conjunction with dev-elk)

- make note of the vault secrets

## Frontend

### Login & Register

- go to localhost:8080
- register a new account (notice how you can change the languages)
- log out, log in
- go to profile tab, update the password, log out and log in to confirm
- enable totp, open a totp app to register it. enter the totp token
- log out, log in, enter token to confirm
- update totp token, log out to confirm

### Profile

- upload picture for avatar
- log out

### Local Quickplay

- don't log in, start local quickplay, toggle sfx, music, shadow, volume slider
- pan around

### AI Quickplay

- confirm that hard is harder than easy difficulty

### Online game

- create lobby, adjust "play to value" to sth lower
- log into another PC, go to domain configured in env.json
- register, go to online game and join lobby, enter lobby code
- click update, start and leave buttons to make sure they work

### Tournament + Blockchain

- prepare metamask integration (john will help)

- create 4 or 8 player tournament
- enter 4 names, play 3 rounds
- click the buttons to make the transactions

### other tabs

- check that leaderboard is working
- check that stats page is working

## Backend

- check /api/docs

## Vault

- stop the compose project
- start it again, enter vault unseal keys in UI
- send root token
- take a peak and entrypoint.sh

## ELK

- get creds from vault UI
- go to dashboards, check Application Dashboard and Online Game
- check elasticsearch indices

## CLI

- do all the things from the frontend in the CLI

## Misc

- check coraza WAF
- check JWT
