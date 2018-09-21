FROM grafana/grafana:5.2.3

COPY ./dist /var/lib/grafana/plugins/freshtracks

USER root
RUN apt-get update && \
    apt-get install -y jq
