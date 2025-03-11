# Build Stage: TypeScript + Webpack
FROM node:23.9.0-alpine3.21 AS web-builder

WORKDIR /app/

# Install dependencies and build
COPY ./package*.json ./

RUN npm clean-install

COPY ./ ./

RUN npm run build

# Build Stage: Custom Caddy with Coraza WAF
FROM caddy:2.9.1-builder-alpine AS builder

# Needed because of CGO_ENABLED=1 below
RUN apk update && apk add build-base

# statically compile caddy
RUN CGO_ENABLED=1 XCADDY_GO_BUILD_FLAGS="-ldflags='-linkmode external -extldflags -static'" \
	xcaddy build --with github.com/corazawaf/coraza-caddy/v2

# always try to make PID 1 unprivileged
RUN addgroup caddy
RUN adduser -h /srv/ -S caddy -G caddy

FROM alpine:3.21.3

COPY --from=builder /usr/bin/caddy /usr/bin/caddy
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group
COPY                ./Caddyfile /etc/caddy/Caddyfile

RUN rm -rf /srv/ && mkdir -p /srv/.local/share/caddy/

# Copy built site from Node.js build stage
COPY --from=web-builder --chown=caddy:caddy /app/dist/ /srv/

RUN chown -R caddy:caddy /srv/

WORKDIR /srv/

EXPOSE 8080
EXPOSE 8443

VOLUME ["/srv/.local/share/caddy/"]

USER caddy

CMD ["/usr/bin/caddy", "run", \
	"--adapter", "caddyfile", \
	"--config", "/etc/caddy/Caddyfile"]
