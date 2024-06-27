#!/usr/bin/env ts-node

// This node script uses CommonJS require
/* eslint-disable @typescript-eslint/no-var-requires */

const { spawn } = require('node:child_process');
const promises = require('node:fs/promises');
const path = require('node:path');

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
  const buildPath = `./deploy/${environment}`;
  const buildDate = new Date().toISOString();
  const envsNew: Envs = {
    BUILD_PATH: buildPath,
    PUBLIC_URL: publicURL,
    REACT_APP_KBASE_ENV: environment,
    REACT_APP_KBASE_DOMAIN: domain,
    REACT_APP_KBASE_LEGACY_DOMAIN: legacy,
    REACT_APP_KBASE_BACKUP_COOKIE_NAME: backupCookie?.name || '',
  };

  Object.assign(process.env, envsNew);
  const proc = spawn('npm', ['run', 'build'], { timeout: 60000 });
  proc.stdout.on('data', (data: Buffer) => {
    console.log(data.toString()); // eslint-disable-line no-console
  });

  proc.on('close', async (code: number) => {
    const build = {
      date: buildDate,
      name: 'Europa',
      environment,
      hash,
      tag,
    };
    let filehandle;
    try {
      filehandle = await promises.open(path.join(buildPath, 'build.json'), 'w');
      await filehandle.write(JSON.stringify(build));
    } finally {
      await filehandle?.close();
    }
  });
};

const main = () => {
  const envs = config.environments;
  const hash = process.env.HASH || '';
  const tag = process.env.TAG || '';
  Object.keys(envs).forEach((env) => {
    build(env, hash, tag, envs[env]);
  });
  build('nodetest', hash, tag, config.environments.ci);
};

if (require.main === module) {
  main();
}
