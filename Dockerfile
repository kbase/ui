FROM bitnami/nginx:latest
USER root

# Copy built static files for all enviroments to image
COPY ./deploy /deploy/

# Copy nginx config template to image
COPY ./scripts/nginx.conf.tmpl /nginx.conf.tmpl

COPY ./scripts/docker_entrypoint.sh /entrypoint.sh
USER 1001
ENTRYPOINT ["/entrypoint.sh"]
