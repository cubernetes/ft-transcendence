### Customization Point 1 ###
FROM docker.elastic.co/elasticsearch/elasticsearch:8.17.3

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

COPY --chmod=755 ./entrypoint /entrypoint.sh

CMD ["/usr/share/elasticsearch/config/startup.sh"]

# No need to set WORKDIR, will be inherited from base image
# No need to set CMD, will be inherited from base image
# No need to set any ENV, will be inherited from base image
# No need to set USER, will be inherited from base image

# Healthcheck defined in ${REPO_ROOT}/elk/elasticsearch/config/startup.sh
HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s --start-interval=1s CMD ["grep", "-Fxq", "0", "/tmp/healthcheck"]

USER 1000
ENTRYPOINT ["/entrypoint.sh"]
