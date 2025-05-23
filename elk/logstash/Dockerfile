### Customization Point 1 ###
FROM docker.elastic.co/logstash/logstash:8.17.3

USER 0

RUN export DEBIAN_FRONTEND=noninteractive && \
	apt update -y && \
	apt install -y jq libpsl-dev libssl-dev build-essential

RUN cd /tmp/ && \
	mkdir curl && cd curl && \
	curl -L https://curl.se/download/curl-8.13.0.tar.gz | tar xzf - && \
	cd *curl* && \
	./configure --with-openssl --disable-shared && \
	make -j && \
	make install

COPY --chmod=555 ./entrypoint.sh /entrypoint.sh

COPY --chmod=555 ./pipeline/ /usr/share/logstash/pipeline/
COPY --chmod=444 ./config/logstash.yml /usr/share/logstash/config/logstash.yml
COPY --chmod=555 ./scripts/import-logstash-ca.sh /usr/local/bin/import-logstash-ca.sh

# No need to set WORKDIR, will be inherited from base image
# No need to set CMD, will be inherited from base image
# No need to set any ENV, will be inherited from base image
# No need to set USER, will be inherited from base image

# Healthcheck defined in ${REPO_ROOT}/elk/logstash/scripts/import-logstash-ca.sh
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=60s --start-interval=1s CMD ["grep", "-Fxq", "0", "/tmp/healthcheck"]

USER 1000
ENTRYPOINT ["/entrypoint.sh"]
