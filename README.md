# ft-transcendence - a pong web app

> A pong app with a heap of add-on features

- Live demo: [https://ft-transcendence.app](https://ft-transcendence.app)

## Build and Run

- Ensure `docker` and `docker compose` are working
- Run `cp .env.example .env`
- Adjust secrets in `.env`, possibly also in `config.env` if you have port issues
- Run `make` or `make prod`

## Advanced/Configuration

- [administrative commands regarding app management]
- [basic steps for configuration]
- Refer to the [Wiki](https://github.com/cubernetes/ft-transcendence/wiki) for more documentation

## Demo

- [a gif showcasing the main feature (pong)]
- [a gif showcasing the additional features (chat, accounts, etc.)]
- [opt: alt text: a gif showcasing the administrative features]

## Core Features

- Interactive webapp to play 3D pong - Front-End (John) && Back-End (Ben & Darren)
- Account management (TBD)
- Join matches via the a CLI client (or maybe [SSH](https://github.com/charmbracelet/wish), let's see) (TBD)
- Overkill security measures (ModSecurity, HashiCorp Vault, 2FA, JWT) (Timo)
- AI opponent (TBD)
- Some accessibility features (TBD)
- Log management and observability (ELK + Grafana) (Sonia)
- Game statistics also on Blockchain (John)

## Debugging / Development

### Websockets

- Use `wscat` to connect to the websocket server via Caddy:
    - `wscat -c ws://localhost:8080/ws`
    - `wscat -c localhost:8080/ws`
    - `wscat -nc wss://localhost:8443/ws`
- Or connect directly via the backend, by patching `compose.yaml`

    ```diff

        backend:
    +       ports:
    +           - "3000:${BACKEND_PORT:3000}"
            build:
                context: "./backend/"
    ```

    - `wscat -c localhost:3000/ws` (no wss)

### Coraza Web Application Firewall (WAF)

- Checking it it's enabled
    - `curl -vk https://localhost:8443/?exec=/bin/bash` should return `403 Forbidden`
- Disabling it
    ```diff
        handle {
    -       import waf
            root * /srv
            file_server
        }
        handle_path /api/* {
    -       import waf
            reverse_proxy http://backend:{$BACKEND_PORT:3000}
        }
    ```

### Makefile

- When running make (dev), arguments can be added to pass on additional flags for docker compose up. For instance `make dev ARGS="--no-attach caddy"` will silence any logs registered by the Caddy container, note that to silence more the flag needs to be repeated, i.e. `make dev ARGS="--no-attach caddy --no-attach backend"`.

## License

- [CC0 1.0 Universal](LICENSE)

```

```
