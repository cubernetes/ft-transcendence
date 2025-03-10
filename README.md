# ft-transcendence - a pong web app

> A pong app with a heap of add-on features

- Live demo: [https://ft-transcendence.app](https://ft-transcendence.app)

## Build and Run

- Set appropriate options in .env (cp from .env.example)
- make dev or make prod

## Advanced/Configuration

- [administrative commands regarding app management]
- [basic steps for configuration]
- Refer to the [Wiki](https://github.com/cubernetes/ft-transcendence/wiki) for more Documentation

## Demo

- [a gif showcasing the main feature (pong)]
- [a gif showcasing the additional features (chat, accounts, etc.)]
- [opt: alt text: a gif showcasing the administrative features]

## Core Features

- Interactive webapp to play 3D pong - Front-End (John) && Back-End (Ben & Darren)
- Account management (TBD)
- Join matches via the a CLI client (or maybe [SSH](https://github.com/charmbracelet/wish), let's see) (TBD)
- Overkill security measures (ModSecurity, HashiCorp Vault, 2FA, JWT) - Timo
- AI opponent (TBD)
- Some accessibility features (TBD)
- Log management and observability (ELK + Grafana) - Sonia
- Game statistics also on Blockchain - John

## Debug

- Websockets: Use wscat to connect to frontend (or backend via container IP):
  wscat -c ws://localhost:8080/ws
  wscat -c localhost:8080/ws
  `backend via container IP` will only work if the backend exposes a port, which it doesn't by default

## License

- [CC0 1.0 Universal](LICENSE)
