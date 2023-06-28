#!/usr/bin/env bash

sed "s/__ENVIRONMENT__/$STATIC_ENVIRONMENT/" /nginx.conf.tmpl > /opt/bitnami/nginx/conf/server_blocks/app.conf
/opt/bitnami/scripts/nginx/entrypoint.sh /opt/bitnami/scripts/nginx/run.sh
