FROM docker.elastic.co/logstash/logstash:8.17.3
USER 0

COPY --from=ft-transcendence-util-image --chmod=755 /curl /usr/bin/curl
COPY --from=ft-transcendence-util-image --chmod=555 /execsudo /execsudo

RUN export DEBIAN_FRONTEND=noninteractive && \
	apt update -y && \
	apt install -y jq

COPY --chmod=555 ./entrypoint.sh /entrypoint.sh
COPY --chmod=555 ./healthcheck.sh /healthcheck.sh

COPY --chmod=555 ./pipeline/ /usr/share/logstash/pipeline/
COPY --chmod=444 ./config/logstash.yml /usr/share/logstash/config/logstash.yml
COPY --chmod=555 ./scripts/import-logstash-ca.sh /usr/local/bin/import-logstash-ca.sh

VOLUME ["/usr/share/logstash/data/", "/etc/logstash/config/certs/"]

HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=60s --start-interval=1s CMD ["/healthcheck.sh"]

ENTRYPOINT ["/entrypoint.sh"]
