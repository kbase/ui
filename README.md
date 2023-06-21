# UI Refresh Test Repo

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) (`npx create-react-app ui-refresh-test --template typescript`). It also includes the following:

- Redux (`@reduxjs/toolkit`) for state management
- `react-router-dom` for routing
- `prettier` for code formatting
- extended eslint configuration and eslint/prettier integration
- npm linting scripts (`lint`, `lint:fix`, `lint:strict`)
- `husky` to enable a `lint:strict` precommit hook
- `.nvmrc` specifying the node version
- Very small example app implementation with mock login
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

First clone the repo into your working directory:

```
git clone git@github.com:kbase/ui.git
```

Install the dependencies:

```
npm install
```

Start the app:

```
npm start
```

### Troubleshooting

- Ensure that your node version matches the version specified in `.nvmrc`. 
We recommend using `nvm` to manage your node versions. 
Run `nvm install` to install and use the node version from `.nvmrc`.
- If you receive the following error message after running `npm start`: 
`Invalid options object. Dev Server has been initialized using an options object that does not match the API schema.` 
then you may need to set the following environment variable: `DANGEROUSLY_DISABLE_HOST_CHECK=true`


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

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can
`eject` at any time. This command will remove the single build dependency from
your project.

Instead, it will copy all the configuration files and the transitive
dependencies (webpack, Babel, ESLint, etc) right into your project so you have
full control over them. All of the commands except `eject` will still work, but
they will point to the copied scripts so you can tweak them. At this point
you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for
small and middle deployments, and you shouldn’t feel obligated to use this
feature. However we understand that this tool wouldn’t be useful if you
couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
