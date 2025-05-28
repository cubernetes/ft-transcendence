FROM hashicorp/vault:1.19.0

RUN apk add --no-cache jq python3 gettext netcat-openbsd

# Get build time environmental variable
ARG VAULT_API_PORT

# Generate config.hcl from template to expand environmental variables
COPY ./config.hcl.template /vault/config/config.hcl.template
RUN envsubst < /vault/config/config.hcl.template > /vault/config/config.hcl

COPY --chmod=555 ./entrypoint.sh /entrypoint.sh
COPY --chmod=555 ./replace_json_templates.py /replace_json_templates.py
COPY --chmod=555 ./healthcheck.sh /healthcheck.sh
COPY             ./policies/ /vault/policies/

# User has 2 minutes to unseal vault. Not sure how to use VAULT_MANUAL_UNSEAL_TIMEOUT environment variable as a parameter
# to --start-period...
HEALTHCHECK --interval=20s --timeout=3s --start-period=120s --start-interval=2s --retries=3 CMD ["/healthcheck.sh"]

CMD ["/entrypoint.sh"]
