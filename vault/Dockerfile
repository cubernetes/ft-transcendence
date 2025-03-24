FROM hashicorp/vault:1.19.0

RUN apk add --no-cache jq python3 bash

COPY ./entrypoint.sh /entrypoint.sh
COPY ./replace_json_templates.py /replace_json_templates.py
COPY ./config.hcl /vault/config/config.hcl
COPY ./env.json /vault/config/env.json

CMD ["bash", "/entrypoint.sh"]
