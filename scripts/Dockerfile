FROM bitnami/nginx:latest
ARG BUILD_ENVIRONMENT=prod
USER root
# RUN apt-get update
# RUN apt-get install -y curl wget
# build all the environments
COPY deploy /deploy/
COPY nginx.conf.tmpl /nginx.conf.tmpl
RUN sed "s/__ENVIRONMENT__/$BUILD_ENVIRONMENT/" /nginx.conf.tmpl > /opt/bitnami/nginx/conf/server_blocks/app.conf
USER 1001
ENTRYPOINT [\
  "/opt/bitnami/scripts/nginx/entrypoint.sh", \
  "/opt/bitnami/scripts/nginx/run.sh" \
]
