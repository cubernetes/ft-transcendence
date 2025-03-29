FROM hashicorp/vault:1.19.0

RUN apk add --no-cache jq python3

COPY ./entrypoint.sh /entrypoint.sh
COPY ./replace_json_templates.py /replace_json_templates.py
COPY ./healthcheck.sh /healthcheck.sh
COPY ./config.hcl /vault/config/config.hcl
COPY ./env.json /vault/config/env.json
COPY ./policies/ /vault/policies/

HEALTHCHECK --interval=10s --timeout=2s --start-period=8s --start-interval=1s --retries=3 CMD ["/healthcheck.sh"]

CMD ["/entrypoint.sh"]
