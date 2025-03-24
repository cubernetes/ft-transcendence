FROM hashicorp/vault:1.19.0

RUN apk add --no-cache jq python3

COPY . .

CMD ["/entrypoint.sh"]
