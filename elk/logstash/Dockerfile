### Customization Point 1 ###
FROM docker.elastic.co/logstash/logstash:8.17.3
USER 0

COPY --from=ft-transcendence-util-image --chmod=755 /curl /usr/bin/curl

RUN export DEBIAN_FRONTEND=noninteractive && \
	apt update -y && \
	apt install -y jq

COPY --chmod=555 ./entrypoint.sh /entrypoint.sh
COPY --from=util-image --chmod=555 /execsudo /execsudo

COPY --chmod=555 ./pipeline/ /usr/share/logstash/pipeline/
COPY --chmod=444 ./config/logstash.yml /usr/share/logstash/config/logstash.yml
COPY --chmod=555 ./scripts/import-logstash-ca.sh /usr/local/bin/import-logstash-ca.sh

# No need to set WORKDIR, will be inherited from base image
# No need to set CMD, will be inherited from base image
# No need to set any ENV, will be inherited from base image
# No need to set USER, will be inherited from base image

# Healthcheck defined in ${REPO_ROOT}/elk/logstash/scripts/import-logstash-ca.sh
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=60s --start-interval=1s CMD ["grep", "-Fxq", "0", "/tmp/healthcheck"]

ENTRYPOINT ["/entrypoint.sh"]
