#!/usr/bin/env ts-node

// This node script uses CommonJS require
/* eslint-disable @typescript-eslint/no-var-requires */

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

const build = (
  environment: string,
  hash: string,
  tag: string,
  envConfig: EnvConfig
) => {
  const {
    domain,
    legacy,
    public_url: publicURL,
    backup_cookie: backupCookie,
  } = envConfig;
  // eslint-disable-next-line no-console
  console.log(`Build environment "${environment}" using this configuration:`, {
    domain,
    legacy,
    publicURL,
    backupCookie,
  });
  let count = 0;
  const build_path = `./deploy/${environment}`;
  const envsNew: Envs = {
    BUILD_PATH: build_path,
    PUBLIC_URL: publicURL,
    REACT_APP_KBASE_ENV: environment,
    REACT_APP_KBASE_DOMAIN: domain,
    REACT_APP_KBASE_LEGACY_DOMAIN: legacy,
    REACT_APP_KBASE_BACKUP_COOKIE_NAME: backupCookie?.name || '',
  };

  Object.assign(process.env, envsNew);
  // const proc = spawn('npm', ['run', 'build'], { timeout: 60000 });
  const proc = spawn('echo', ['npm', 'run', 'build'], { timeout: 60000 });
  proc.stdout.on('data', (data: string) => {
    // eslint-disable-next-line no-console
    console.log({ count, stdout: `${data}` });
    count += 1;
  });

  proc.on('close', (code: number) => {
    const artifact = {
      environment,
      hash,
      name: 'Europa',
      tag,
    };
    console.log({ artifact, code }); // eslint-disable-line no-console
  });
};

const main = () => {
  const envs = config.environments;
  const hash = process.env.HASH || '';
  const tag = process.env.TAG || '';
  Object.keys(envs).forEach((env) => {
    // console.log({ env, data: envs[env] }); // eslint-disable-line no-console
    build(env, hash, tag, envs[env]);
  });
  build('nodetest', hash, tag, config.environments.ci);
};

if (require.main === module) {
  main();
}
