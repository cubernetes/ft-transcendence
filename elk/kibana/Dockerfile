FROM docker.elastic.co/kibana/kibana:8.17.3
USER 0

COPY --from=ft-transcendence-util-image --chmod=755 /curl /usr/bin/curl
COPY --from=ft-transcendence-util-image --chmod=555 /execsudo /execsudo

RUN export DEBIAN_FRONTEND=noninteractive && \
	apt update -y && \
	apt install -y jq

COPY --chmod=555 ./entrypoint.sh /entrypoint.sh
COPY --chmod=555 ./healthcheck.sh /healthcheck.sh

COPY --chmod=444 ./config/kibana.yml /usr/share/kibana/config/kibana.yml
COPY --chmod=555 ./dashboards /usr/share/kibana/dashboards/
COPY --chmod=555 ./setup-dashboards.sh /usr/share/kibana/setup-dashboards.sh

CMD ["sh", "-xec", "/usr/local/bin/kibana-docker & KIBANA_PID=$! ; echo \"Kibana starting with PID $KIBANA_PID\" ; sleep 120 ; /usr/share/kibana/setup-dashboards.sh & wait $KIBANA_PID"]

<<<<<<< HEAD
VOLUME ["/usr/share/kibana/data/"]

# No need to set WORKDIR, will be inherited from base image
# No need to set CMD, will be inherited from base image
# No need to set any ENV, will be inherited from base image
# No need to set USER, will be inherited from base image

# Healthcheck defined inline in the Dockerfile CMD directive, 7 lines above /\
HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s --start-interval=1s CMD ["grep", "-Fxq", "0", "/tmp/healthcheck"]
=======
HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s --start-interval=1s CMD ["/healthcheck.sh"]
>>>>>>> b2a8f32d (Extract healthchecks to separate files)

ENTRYPOINT ["/entrypoint.sh"]
