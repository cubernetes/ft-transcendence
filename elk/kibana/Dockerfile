### Customization Point 1 ###
FROM docker.elastic.co/kibana/kibana:8.17.3

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

COPY --chmod=755 ./entrypoint.sh /entrypoint.sh

CMD ["sh", "-xec", ": Healthcheck ; TERM=linux setsid -f watch -xtcn5 curl --no-progress-meter --fail --write-out '%output{/tmp/healthcheck}%{exitcode}' \"http://localhost:${KIBANA_PORT}/api/status\" 1>/dev/null 2>&1 ; /usr/local/bin/kibana-docker & KIBANA_PID=$! ; echo \"Kibana starting with PID $KIBANA_PID\" ; sleep 120 ; /usr/share/kibana/setup-dashboards.sh & wait $KIBANA_PID"]

# No need to set WORKDIR, will be inherited from base image
# No need to set CMD, will be inherited from base image
# No need to set any ENV, will be inherited from base image
# No need to set USER, will be inherited from base image

# Healthcheck defined inline in the Dockerfile CMD directive, 7 lines above /\
HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s --start-interval=1s CMD ["grep", "-Fxq", "0", "/tmp/healthcheck"]

USER 1000
ENTRYPOINT ["/entrypoint.sh"]
