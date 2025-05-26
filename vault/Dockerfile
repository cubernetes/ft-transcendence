FROM hashicorp/vault:1.19.0

RUN apk add --no-cache jq python3 gettext

# Get build time environmental variable
ARG VAULT_API_PORT

# Generate config.hcl from template to expand environmental variables
COPY ./config.hcl.template /vault/config/config.hcl.template
RUN envsubst < /vault/config/config.hcl.template > /vault/config/config.hcl

COPY --chmod=555 ./entrypoint.sh /entrypoint.sh
COPY --chmod=555 ./replace_json_templates.py /replace_json_templates.py
COPY --chmod=555 ./healthcheck.sh /healthcheck.sh
COPY             ./policies/ /vault/policies/

HEALTHCHECK --interval=10s --timeout=2s --start-period=8s --start-interval=1s --retries=3 CMD ["/healthcheck.sh"]

CMD ["/entrypoint.sh"]
