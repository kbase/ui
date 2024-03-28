# Devcontainer

This devcontainer is very basic - it just provides a `node` version 18 container, with
enough OS dependencies to work with repo tools and to play nice with VSC.

The Dockerfile should roughly match that utilized by the GHA workflows.

## Why?

With the devcontainer runtime (Linux, node) matching GHA, tools should match and npm
installs should match. npm installs are often binary, and platform-specific; though they
should behave the same, there may be subtle differences. 

Host dependencies can be avoided by installing them into the devcontainer. E.g. the
proper version of node and npm, git, bash, make. This allows development on any platform
which supports Docker and VSC.

## Quick Start

1. After starting the devcontainer with VSC, a terminal should open automaitcally. If not,
open one.

    The terminal should open inside the container:

    ```shell
    root@europa-ui:/workspace# 
    ```

2. Install dependencies:

    ```shell
    npm install
    ```

3. Run tests:

    ```shell
    npm run test . -- --coverage --verbose
    ```

4. Running devserver:

    ```shell
    npm run start
    ```

