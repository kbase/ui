#!/usr/bin/env bash

HASH=$(git rev-parse HEAD) \
TAG=$(git describe --tags) \
scripts/build_deploy.ts
