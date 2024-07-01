#!/usr/bin/env bash

DATE=$(date -Iseconds) \
HASH=$(git rev-parse HEAD) \
TAG=$(git describe --tags) \
node_modules/.bin/ts-node scripts/build_deploy.ts
