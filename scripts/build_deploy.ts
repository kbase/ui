#!/usr/bin/env ts-node

// invoke using
// node --loader ts-node/esm ./scripts/build_deploy.ts

// This node script uses CommonJS require
/* eslint-disable @typescript-eslint/no-var-requires */

// import { spawn } from 'node:child_process';

// import * as config from '../config.json';
const { spawn } = require('node:child_process');

const config = require('../config.json');

interface Envs {
  [key: string]: string;
}

interface EnvConfig {
  domain: string;
  legacy: string;
  public_url: string;
  backup_cookie?: {
    name: string;
  };
}
/*
console.log({ config }); // eslint-disable-line no-console

const environment = '';
const data = '';
*/

const build = (
  environment: string,
  { domain, legacy, public_url, backup_cookie }: EnvConfig
) => {
  let count = 0;
  const envsNew: Envs = {
    BUILD_PATH: `./deploy/${environment}`,
    PUBLIC_URL: public_url,
    REACT_APP_KBASE_ENV: environment,
    REACT_APP_KBASE_DOMAIN: domain,
    REACT_APP_KBASE_LEGACY_DOMAIN: legacy,
    REACT_APP_KBASE_BACKUP_COOKIE_NAME: backup_cookie?.name || '',
  };

  Object.assign(process.env, envsNew);
  // const proc = spawn('npm', ['run', 'build'], { timeout: 60000 });
  const proc = spawn('echo', ['npm', 'run', 'build'], { timeout: 60000 });
  proc.stdout.on('data', (data: string) => {
    // eslint-disable-next-line no-console
    console.log({ count, stdout: `${data}` });
    count += 1;
  });
};

const main = () => {
  const envs = config.environments;
  Object.keys(envs).forEach((env) => {
    // console.log({ env, data: envs[env] }); // eslint-disable-line no-console
    build(env, envs[env]);
  });
  build('nodetest', config.environments.ci);
};

if (require.main === module) {
  main();
}

//export {};
