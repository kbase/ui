#!/usr/bin/env bash

# Here we are using bash "here strings"
IFS=$'\n' read  -d '' -r -a enviromentsConfig  <<< "$(jq -r '.environments
     | keys[] as $k
     | [($k), (.[$k]["domain"]) , (.[$k]["legacy"]) , (.[$k]["public_url"]) , (.[$k]["backup_cookie"]["name"]) , (.[$k]["backup_cookie"]["domain"])]
     | join(" ")' config.json)"

for enviro in "${enviromentsConfig[@]}"; do
  read -a envConf <<< "$enviro"
  echo "Building static files for enviroment \"${envConf[0]}\"...";

  BUILD_PATH="./deploy/${envConf[0]}" \
  REACT_APP_KBASE_ENV="${envConf[0]}" \
  REACT_APP_KBASE_DOMAIN="${envConf[1]}" \
  REACT_APP_KBASE_LEGACY_DOMAIN="${envConf[2]}" \
  PUBLIC_URL="${envConf[3]}" \
  REACT_APP_KBASE_BACKUP_COOKIE_NAME="${envConf[4]}" \
  REACT_APP_KBASE_BACKUP_COOKIE_DOMAIN="${envConf[5]}" \
  npm run build && \
  echo "Built static files for enviroment \"${envConf[0]}\".";
done
