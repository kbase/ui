#!/usr/bin/env node

// This node script uses CommonJS require
/* eslint-disable @typescript-eslint/no-var-requires */

const { spawn } = require('node:child_process');

const config = require('../config.json');

const build = (environment, { domain, legacy, public_url, backup_cookie }) => {
  let count = 0;
  process.env['BUILD_PATH'] = `./deploy/${environment}`;
  process.env['REACT_APP_KBASE_ENV'] = environment;
  process.env['REACT_APP_KBASE_DOMAIN'] = domain;
  process.env['REACT_APP_KBASE_LEGACY_DOMAIN'] = legacy;
  process.env['REACT_APP_KBASE_BACKUP_COOKIE_NAME'] = backup_cookie?.name;
  process.env['PUBLIC_URL'] = public_url;
  const proc = spawn('npm', ['run', 'build'], { timeout: 60000 });
  proc.stdout.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.log({ count, stdout: `${data}` });
    count += 1;
  });
};

const main = () => {
  const envs = config.environments;
  Object.keys(envs).forEach((env) => {
    console.log({ env, data: envs[env] }); // eslint-disable-line no-console
    build(env, envs[env]);
  });
  build('nodetest', config.environments.ci);
};

if (require.main === module) {
  main();
}
