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

- When running make (dev), arguments can be added to pass on additional flags for docker compose up. For instance `make dev ARGS="--no-attach caddy"` will silence any logs registered by the Caddy container, note that to silence more the flag needs to be repeated, i.e. `make dev ARGS="--no-attach caddy --no-attach backend"`. Similarly, you can also use `ARGS="--attach caddy"` for inclusive logging.

### API endpoint

- Check `/api/docs` for a list of backend endpoints auto-generated by swagger UI.

### Vault

See [vault/README.md](./vault/README.md)

## Project Modules Tally

|               |        Module         |                       Notes                       | Point |
| :-----------: | :-------------------: | :-----------------------------------------------: | :---: |
|      Web      |        Backend        |                 Fastify + Node.js                 |   1   |
|               |       Frontend        |                 Tailwind CSS + TS                 |  0.5  |
|               |       Database        |                      SQLite                       |  0.5  |
|               |      Blockchain       |               Avalanche + Solidity                |   1   |
|     Game      |    Remote Players     |                                                   |   1   |
| Cybersecurity |   Secret Management   |         WAF/ModSecurity + HashiCorp Vault         |   1   |
|               |       2FA + JWT       |                                                   |   1   |
|    Devops     |    Log Management     |       ELK (Elasticsearch, Logstash, Kibana)       |   1   |
|   Graphics    |     3D Techniques     |                    Babylon.js                     |   1   |
| Accessiblity  | Browser Compatability |             Firefox Default + Chrome              |  0.5  |
|     Pong      |   Server-side Pong    |                                                   |   1   |
|               |      CLI Client       |                                                   |   1   |
|               |                       |                  ✅ Committed ✅                  | 10.5  |
|     User      |  Standard Management  |           Tedious Albeit Weird Without            |   1   |
|               |                       |             🟡 Partially Committed 🟡             | 11.5  |
|     User      | Remote Authentication | Google Sign-in, Simple But Extra API Key Required |   1   |
|     Game      |     Customization     |                                                   |  0.5  |
|     Algo      |      AI Opponent      |                                                   |   1   |
|     Algo      |    Stats Dashboard    |                                                   |  0.5  |
| Accessibility |   Multiple Language   |                   Ultra-simple                    |  0.5  |
| Accessibility | Server-side Rendering |                   Ultra-simple                    |  0.5  |
| Cybersecurity |    GDPR Compliance    |                                                   |  0.5  |
|    Devops     |   Monitoring System   |               Prometheus + Grafana                |  0.5  |
|               |                       |                ⏳ Total Planned ⏳                | 16.5  |

## License

- [CC0 1.0 Universal](LICENSE)
