# UI for KBase

![build and push status](https://github.com/kbase/ui/actions/workflows/build_and_push.yml/badge.svg)

This project manages the User Interface (UI) for KBase tools, not including the
narrative interface or documentation site [kbase.us](https://kbase.us).

## Tech Stack

- **Build Tool**: [Vite](https://vitejs.dev/) - Fast, modern build tool with
  native ES modules
- **Framework**: [React 18](https://react.dev/) with TypeScript
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) with
  RTK Query
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Styling**: [Sass](https://sass-lang.com/) modules with [Material-UI](https://mui.com/)
- **Testing**: [Vitest](https://vitest.dev/) with React Testing Library
- **Component Docs**: [Storybook 8](https://storybook.js.org/)
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

## Architectural Decision Records

An architecture decision record (ADR) is a document that captures an important
architecture decision made along with its context and consequences. They track
major decisions that change the course of the project. You can find the ADRs
for this project in [`docs/adrs`](docs/adrs).

## Getting Started

Ensure that your node version matches the version specified in `.nvmrc`. We
recommend using [`nvm`](https://github.com/nvm-sh/nvm) to manage your node
versions. Run `nvm install` to install and use the node version from `.nvmrc`.

Clone the repository into your working directory:

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

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

### `npm start`

Runs the app in development mode with hot module replacement (HMR).
The page will reload instantly when you make edits.

### `npm test`

Launches Vitest in watch mode. Press `a` to run all tests, `f` to run only
failed tests, or `q` to quit.

```sh
npm test              # Watch mode
npm run test:ui       # Vitest UI (browser-based test runner)
npm run test:coverage # Run with coverage report
```

### `npm run build`

Builds the app for production to the `build` folder. The build is minified
and optimized for best performance.

### `npm run lint`

Runs ESLint, Prettier, Stylelint, and TypeScript checks.

```sh
npm run lint        # Show errors/warnings
npm run lint:fix    # Auto-fix where possible
npm run lint:strict # Fail on any errors/warnings (used in pre-commit hook)
```

### `npm run storybook`

Opens Storybook locally for component development and documentation.
Watches `*.stories.tsx` files and launches a local server at
[http://localhost:6006](http://localhost:6006).

```sh
npm run storybook       # Start dev server
npm run build-storybook # Build static storybook
```

## Development

### Environment Variables

Environment variables are prefixed with `VITE_` and accessed via `import.meta.env`:

```typescript
const domain = import.meta.env.VITE_KBASE_DOMAIN;
const isDev = import.meta.env.MODE === 'development';
```

See `.env` files for available variables.

### API Proxy

In development, requests to `/services/*` are proxied to the KBase API
(configured in `vite.config.ts`). This avoids CORS issues during local
development.

### Network Access

To access the dev server from other devices on your network
(e.g., mobile testing):

```sh
npm start -- --host
```

Then access via your machine's IP address or hostname.

## Project Structure

```
src/
├── app/              # App setup, routes, store
├── common/           # Shared components, hooks, utilities
│   ├── api/          # RTK Query API definitions
│   └── components/   # Reusable UI components
├── features/         # Feature-based modules
│   ├── auth/         # Authentication
│   ├── collections/  # Data collections
│   ├── navigator/    # Narrative browser
│   └── ...
├── stories/          # Storybook stories
└── test/             # Test utilities and mocks
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure tests pass: `npm test`
4. Ensure linting passes: `npm run lint:strict`
5. Submit a pull request

The pre-commit hook will run `lint:strict` automatically.
