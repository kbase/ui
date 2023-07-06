#!/bin/sh

sed "s/__ENVIRONMENT__/$STATIC_ENVIRONMENT/" /nginx.conf.tmpl > /etc/nginx/conf.d/app.conf
nginx -g "daemon off;"
