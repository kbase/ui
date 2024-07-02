# `scripts/`

This directory contains scripts which support Europa development and deployment.

## `build_deploy.sh`

This script is run as part of the [github action][gha-build] which produces the
Europa release image.

This file collects meta information about the build itself and runs
the `build_deploy.ts` script which ultimately runs `npm run build`.

[gha-build]: https://github.com/kbase/ui/blob/main/.github/workflows/reusable_build-push.yml#L50-L51

## `build_deploy.ts`

This script contains all the logic for building a deployment of Europa.
It produces a copy for each environment configured in the `../config.json`
configuration file.

For each environment it runs `npm run build` and creates a build artifact named
`build.json` which contains the build date, git commit hash and git tag name.

## `docker_entrypoint.sh`

When deployed as a service, a Europa release image uses the `STATIC_ENVIRONMENT`
environment variable to serve the correct build. When the service is launched,
this script generates the nginx config for the specified environment.

## `lint.fix.sh`

This lint fixer script rewrites code to conform with our code lint rules.

## `lint.sh`

This lint script shows all warnings and errors according to our lint rules.

## `lint.strict.sh`

This lint script shows all warnings and errors according to our lint rules and
fails if there are any.

## `nginx.conf.tmpl`

The basic nginx config template for a deployed environment. Used by the
`docker_entrypoint.sh` script.

## `tsconfig.json`

This configuration, currently empty, is required because our `ts-node` scripts
use CommonJS require and are therefore incompatible with the ECMAScript modules
our front end is configured to use.

See also:

- [TypeStrong/ts-node #1997][ts-node-1997]
- [TypeStrong/ts-node #2077][ts-node-2077]

[ts-node-1997]: https://github.com/TypeStrong/ts-node/issues/1997
[ts-node-2077]: https://github.com/TypeStrong/ts-node/issues/2077
