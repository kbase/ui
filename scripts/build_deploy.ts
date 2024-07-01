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

/* This is the schema for an environment in config.json */
interface EnvConfig {
  domain: string;
  legacy: string;
  public_url: string;
  backup_cookie?: {
    name: string;
  };
}

/* Run npm run build for a given environment. */
const build = async (
  environment: string,
  date: string,
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

  /* Update environment variables to be used by npm run build */
  const buildPath = `./deploy/${environment}`;
  const envsNew: Envs = {
    BUILD_PATH: buildPath,
    PUBLIC_URL: publicURL,
    REACT_APP_KBASE_ENV: environment,
    REACT_APP_KBASE_DOMAIN: domain,
    REACT_APP_KBASE_LEGACY_DOMAIN: legacy,
    REACT_APP_KBASE_BACKUP_COOKIE_NAME: backupCookie?.name || '',
  };
  Object.assign(process.env, envsNew);

  /* Return a promise that resolves when npm run build is finished and the
   * build artifact is written.
   */
  return new Promise((resolve) => {
    const proc = spawn('npm', ['run', 'build'], { timeout: 60000 });

    /* Print stdout. This is not necessary, strictly speaking, but is a good
     * place to start if something goes wrong.
     */
    proc.stdout.on('data', (data: Buffer) => {
      console.log(data.toString()); // eslint-disable-line no-console
    });

    /* On close, write the build artifact and resolve the promise. */
    proc.on('close', async (code: number) => {
      const buildArtifact = {
        name: 'Europa',
        date,
        environment,
        hash,
        tag,
      };
      let filehandle;
      try {
        filehandle = await promises.open(
          path.join(buildPath, 'build.json'),
          'w'
        );
        await filehandle.write(JSON.stringify(buildArtifact));
      } finally {
        await filehandle?.close();
      }
      // eslint-disable-next-line no-console
      console.log(`Build for ${environment} complete.`);
      resolve(buildArtifact);
    });
  });
};

/* Take an array and split it into chunks of size at most chunkSize. */
const chunk = <T>(items: T[], chunkSize: number) => {
  const nChunks = Math.floor(items.length / chunkSize) + 1;
  const chunks: T[][] = Array(nChunks)
    .fill(0)
    .map(() => []);
  items.forEach((item, ix) => {
    const index = Math.floor(ix / chunkSize);
    chunks[Math.floor(index)].push(item);
  });
  return chunks;
};

/* Make it so. */
const main = async () => {
  const envs = config.environments;
  const date = process.env.DATE || new Date().toISOString();
  const hash = process.env.HASH || '';
  const tag = process.env.TAG || '';
  const keysSort = Object.keys(envs).sort();
  const maxWorkers = 4;
  const envGroups = chunk(keysSort, maxWorkers);
  for (const group in envGroups) {
    /* Run at most maxWorkers builds at a time: */
    await Promise.all(
      envGroups[group].map((env) => build(env, date, hash, tag, envs[env]))
    );
  }
};

if (require.main === module) {
  main();
}
