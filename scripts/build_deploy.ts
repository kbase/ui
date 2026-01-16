#!/usr/bin/env ts-node

// This node script uses CommonJS require
/* eslint-disable @typescript-eslint/no-var-requires */

const { spawn } = require('node:child_process');
const promises = require('node:fs/promises');
const path = require('node:path');

const config = require('../config.json');

/* This is the schema for an environment in config.json */
interface EnvironmentConfig {
  domain: string;
  legacy: string;
  public_url: string;
  backup_cookie?: {
    name: string;
    domain: string;
  };
  cdm_domain?: string;
  redirect_whitelist?: string[];
}

interface BuildParameters {
  environment: string;
  environmentConfig: EnvironmentConfig;
  date: string;
  hash: string;
  tag: string;
}

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

/* Update environment variables to be used by npm run build. */
const setEnvironment = (
  buildPath: string,
  buildParameters: BuildParameters
) => {
  const { environment, environmentConfig } = buildParameters;
  const {
    domain,
    legacy,
    public_url: publicURL,
    backup_cookie: backupCookie,
    cdm_domain: cdmDomain,
    redirect_whitelist: redirectWhitelist,
  } = environmentConfig;

  const envsNew: Record<string, string> = {
    BUILD_PATH: buildPath,
    VITE_BASE_URL: publicURL,
    VITE_KBASE_ENV: environment,
    VITE_KBASE_DOMAIN: domain,
    VITE_KBASE_LEGACY_DOMAIN: legacy,
    VITE_KBASE_BACKUP_COOKIE_NAME: backupCookie?.name || '',
    VITE_KBASE_BACKUP_COOKIE_DOMAIN: backupCookie?.domain || '',
    VITE_KBASE_CDM_DOMAIN: cdmDomain || 'cdmhub.' + domain,
    VITE_REDIRECT_WHITELIST: redirectWhitelist?.join(',') || '',
  };
  Object.assign(process.env, envsNew);
};

/* Run npm run build for a given environment. */
const build = (buildParameters: BuildParameters) => {
  const { environment, environmentConfig, date, hash, tag } = buildParameters;
  // eslint-disable-next-line no-console
  console.log(
    `Build environment "${environment}" using this configuration:`,
    environmentConfig
  );

  /* Compute build path and set environment variables. */
  const buildPath = `./deploy/${environment}`;
  setEnvironment(buildPath, buildParameters);

  /* Return a promise that resolves when npm run build is finished and the
   * build artifact is written.
   */
  return new Promise((resolve) => {
    /* Run npm run build for these parameters. */
    const proc = spawn('npm', ['run', 'build'], { timeout: 60000 });

    /* Print stdout. This is not necessary, strictly speaking, but is a good
     * place to start if something goes wrong.
     */
    proc.stdout.on('data', (data: Buffer) => {
      console.log(data.toString()); // eslint-disable-line no-console
    });

    /* On close, write the build artifact and resolve the promise. */
    proc.on('close', async (code: number) => {
      const buildArtifact = { name: 'Europa', date, environment, hash, tag };
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

/* Make it so. */
const main = async () => {
  const envs: Record<string, EnvironmentConfig> = config.environments;
  const date = process.env.DATE || new Date().toISOString();
  const hash = process.env.HASH || '';
  const tag = process.env.TAG || '';
  const keysSort = Object.keys(envs).sort();
  const maxWorkers = 4;
  /* Run at most maxWorkers builds at a time: */
  const envGroups = chunk(keysSort, maxWorkers);
  /* Wait for each group of builds to run for each environment in the group. */
  for (const group in envGroups) {
    await Promise.all(
      envGroups[group].map((env) =>
        build({
          environment: env,
          environmentConfig: envs[env],
          date,
          hash,
          tag,
        })
      )
    );
  }
};

if (require.main === module) {
  main();
}
