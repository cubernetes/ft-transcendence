# Build Stage: Custom Caddy with Coraza WAF
FROM caddy:2.9.1-builder-alpine AS builder

# Needed because of CGO_ENABLED=1 below
RUN apk update && apk add build-base

# statically compile caddy
RUN CGO_ENABLED=1 XCADDY_GO_BUILD_FLAGS="-ldflags='-linkmode external -extldflags -static'" \
	xcaddy build --with github.com/corazawaf/coraza-caddy/v2

# make PID 1 unprivileged
RUN addgroup caddy
RUN adduser -h /frontend/ -S caddy -G caddy

FROM alpine:3.21.3

COPY --from=builder      /usr/bin/caddy /usr/bin/caddy
COPY --from=builder      /etc/passwd /etc/passwd
COPY --from=builder      /etc/group /etc/group
COPY --chown=caddy:caddy ./Caddyfile /etc/caddy/Caddyfile

RUN rm -rf /frontend/ && mkdir -p /frontend/.local/share/caddy/

RUN chown -R caddy:caddy /frontend/

WORKDIR /frontend/

EXPOSE 8080
EXPOSE 8443

VOLUME ["/frontend/.local/share/caddy/", "/frontend/dist/"]

USER caddy

ENV WATCH=0

CMD ["sh", "-c", "/usr/bin/caddy run --watch=$WATCH --adapter caddyfile --config /etc/caddy/Caddyfile"]