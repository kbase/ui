FROM cgr.dev/chainguard/nginx
USER root

## Install sed command needed for startup script
RUN apk add --no-cache sed jq

## Copy built static files for all enviroments to image
COPY ./deploy /deploy/

## Copy nginx config template and startup script to image
COPY ./scripts/nginx.conf.tmpl /nginx.conf.tmpl
COPY ./scripts/docker_entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
