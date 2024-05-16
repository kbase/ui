# UI for KBase

![build and push status](https://github.com/kbase/ui/actions/workflows/build_and_push.yml/badge.svg)

This project manages the User Interface (UI) for KBase tools, not including the
narrative interface or documentation site [kbase.us](https://kbase.us).

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)
using the command `npx create-react-app ui-refresh-test --template typescript`.

It also includes the following:

- Redux (`@reduxjs/toolkit`) for state management
- `react-router-dom` for routing
- `prettier` for code formatting
- extended eslint configuration and eslint/prettier integration
- npm linting scripts (`lint`, `lint:fix`, `lint:strict`)
- `husky` to enable a `lint:strict` precommit hook
- `.nvmrc` specifying the node version
- `.editorconfig` for cross-editor config defaults. See
      [editorconfig.org](https://editorconfig.org) for compatability
- Storybook (`npm run storybook`) for dev docs, style examples, and component
    examples.

## Architectural Decision Records

An architecture decision record (ADR) is a document that captures an important
architecture decision made along with its context and consequences. They track
major decisions that change the course of the project. You can find the ADRs
for this project in [`docs/adrs`](docs/adrs).

## Getting Started

First clone the repository into your working directory:

```sh
git clone git@github.com:kbase/ui.git
```

Install the dependencies:

```sh
npm install
```

Start the app:

```sh
npm start
```

### Troubleshooting

- Ensure that your node version matches the version specified in `.nvmrc`.
We recommend using [`nvm`](https://github.com/nvm-sh/nvm) to manage your node
versions. Run `nvm install` to install and use the node version from `.nvmrc`.
- If you receive the following error message after running `npm start`:
`Invalid options object. Dev Server has been initialized using an options object that does not match the API schema.`
then you may need to set the following environment variable:
`DANGEROUSLY_DISABLE_HOST_CHECK=true`
- If you are using a Mac with an M1 or M2 chip, you may run into an
error caused by `canvas` and `node-gyp` after running `npm install`.

    - First, make sure your global python version (`python --version`)
    is under 3.12.
    - If the install step still isn't working, try to install node-canvas
    from source by following the Installation: Mac OS X, HomeBrew steps below
    or on [this page](https://github.com/Automattic/node-canvas/wiki/Installation:-Mac-OS-X).

        - `brew install pkg-config cairo pango libpng jpeg giflib librsvg`
    - This python aspect of this issue may become obsolete once
    the `node-gyp` peer dependency is able to upgrade to v10+.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests][running-tests]  for more information.

[running-tests]: https://facebook.github.io/create-react-app/docs/running-tests

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the
best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about
[deployment](https://facebook.github.io/create-react-app/docs/deployment) for
more information.

### `npm run lint`, `npm run lint:fix`, `npm run lint:strict`

Runs eslint/prettier and shows errors/warnings. `npm run lint:fix` will fix
files in-place where possible. `npm run lint:strict` will fail with any
errors/warnings and is used as a pre-commit hook.

### `npm run storybook`

Opens storybook locally. Builds and watches `*.stories.[tsx|mdx]` files and
launches a local storybook server. The storybook contains component examples
and other dev documentation.
