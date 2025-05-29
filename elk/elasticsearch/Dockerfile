FROM docker.elastic.co/elasticsearch/elasticsearch:8.17.3
USER 0

COPY --from=ft-transcendence-util-image --chmod=755 /curl /usr/bin/curl
COPY --from=ft-transcendence-util-image --chmod=555 /execsudo /execsudo

RUN export DEBIAN_FRONTEND=noninteractive && \
	apt update -y && \
	apt install -y jq

COPY --chmod=555 ./entrypoint.sh /entrypoint.sh
COPY --chmod=555 ./healthcheck.sh /healthcheck.sh

COPY --chmod=555 ./config/generate-certs.sh /usr/share/elasticsearch/config/generate-certs.sh
COPY --chmod=555 ./config/startup.sh        /usr/share/elasticsearch/config/startup.sh
COPY --chmod=555 ./setup-single-node.sh     /usr/share/elasticsearch/setup-single-node.sh

COPY --chmod=444 ./config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml
COPY --chmod=444 ./config/ilm-policy.json /usr/share/elasticsearch/config/ilm-policy.json

ARG CERTS_DIR="/usr/share/elasticsearch/config/certs"

RUN mkdir -p -- "$CERTS_DIR" && \
    chown -R elasticsearch:elasticsearch -- "$CERTS_DIR" && \
    chmod -R 770 -- "$CERTS_DIR"

VOLUME ["/usr/share/elasticsearch/data/", "/usr/share/elasticsearch/config/certs/"]

CMD ["/usr/share/elasticsearch/config/startup.sh"]

HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s --start-interval=1s CMD ["grep", "-Fxq", "0", "/tmp/healthcheck"]

ENTRYPOINT ["/entrypoint.sh"]
