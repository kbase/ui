#!/usr/bin/env bash


declare -a enviroments=(
# "<name>         <domain>                <legacy-domain>"
  "ci-europa      ci-europa.kbase.us      legacy.ci-europa.kbase.us"
  "narrative-dev  narrative-dev.kbase.us  legacy.narrative-dev.kbase.us"
)

for enviro in "${enviroments[@]}"; do
  read -a strarr <<< "$enviro"
  echo "Building static files for enviroment \"${strarr[0]}\"...";

  BUILD_PATH="./deploy/${strarr[0]}" \
  REACT_APP_KBASE_DOMAIN="${strarr[1]}" \
  REACT_APP_KBASE_LEGACY_DOMAIN="${strarr[2]}" \
  npm run build && \
  echo "Built static files for enviroment \"${strarr[0]}\".";
done
