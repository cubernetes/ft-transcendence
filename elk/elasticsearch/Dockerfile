### Customization Point 1 ###
FROM docker.elastic.co/elasticsearch/elasticsearch:8.17.3
USER 0

COPY --from=ft-transcendence-curl_base --chmod=755 /curl /usr/bin/curl

RUN export DEBIAN_FRONTEND=noninteractive && \
	apt update -y && \
	apt install -y jq psmisc

COPY --chmod=555 ./entrypoint.sh /entrypoint.sh

COPY --chmod=555 ./config/generate-certs.sh /usr/share/elasticsearch/config/generate-certs.sh
COPY --chmod=555 ./config/startup.sh        /usr/share/elasticsearch/config/startup.sh
COPY --chmod=555 ./setup-single-node.sh     /usr/share/elasticsearch/setup-single-node.sh

COPY --chmod=444 ./config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml
COPY --chmod=444 ./config/ilm-policy.json /usr/share/elasticsearch/config/ilm-policy.json

CMD ["/usr/share/elasticsearch/config/startup.sh"]

# No need to set WORKDIR, will be inherited from base image
# No need to set CMD, will be inherited from base image
# No need to set any ENV, will be inherited from base image
# No need to set USER, will be inherited from base image

# Healthcheck defined in ${REPO_ROOT}/elk/elasticsearch/config/startup.sh
HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s --start-interval=1s CMD ["grep", "-Fxq", "0", "/tmp/healthcheck"]

ENTRYPOINT ["/entrypoint.sh"]
