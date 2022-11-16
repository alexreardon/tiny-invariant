import type { Config } from '@verdaccio/types';
import YAML from 'js-yaml';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import * as verdaccio from 'verdaccio';
import { $ } from 'zx';

import { fsUtil } from './fs-util.mjs';
import { networkUtil } from './network-util.mjs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const PATHS = {
  PACKAGE_ROOT_DIRECTORY: path.join(__dirname, '..'),
  PACKAGE_ROOT_NPMRC: path.join(__dirname, '..', '.npmrc'),
  VERDACCIO_CONFIG: path.join(__dirname, 'verdaccio-config.yaml'),
  VERDACCIO_TEMP_FOLDER: path.join(__dirname, '.verdaccio'),
  VERDACCIO_TEMP_FOLDER_CACHE: path.join(__dirname, '.verdaccio', 'cache'),
  VERDACCIO_TEMP_FOLDER_STORAGE: path.join(__dirname, '.verdaccio', 'storage'),
} as const;

type Logger = {
  info: typeof console.info;
  warn: typeof console.warn;
  error: typeof console.error;
};

const logger: Logger = {
  info: console.info,
  warn: console.warn,
  error: console.error,
};

async function startVerdaccioServer() {
  // Verdaccio initialization with its Node.js API is based on https://verdaccio.org/docs/verdaccio-programmatically#using-the-module-api
  const verdaccioConfigFile = await fs.promises.readFile(PATHS.VERDACCIO_CONFIG, 'utf8');
  const verdaccioConfig = YAML.load(verdaccioConfigFile) as Config;
  const cache = PATHS.VERDACCIO_TEMP_FOLDER_CACHE;
  const config: Config = {
    ...verdaccioConfig,
    storage: PATHS.VERDACCIO_TEMP_FOLDER_STORAGE,
    self_path: cache,
  };

  const app = await verdaccio.runServer(config);
  const port = await networkUtil.getRandomPort();
  await new Promise<void>((resolve, reject) => {
    logger.info(`[Verdaccio] starting server on port ${port}`);
    app.listen(port, function listeningListener() {
      logger.info(`[Verdaccio] server started!`);
      resolve();
    });
    app.on('error', reject);
  });

  return { verdaccioPort: port };
}

async function publishToVerdaccio(verdaccioPort: number) {
  // Check if .npmrc file in the root of the package exists and if so, abort
  const npmrcExists = await fsUtil.checkIfFileExists(PATHS.PACKAGE_ROOT_NPMRC);
  if (npmrcExists) {
    throw new Error(
      `could not publish to verdaccio, reason: a .npmrc file exists in the package root, but we need to overwrite its contents --> aborted!`,
    );
  }

  try {
    /**
     * Unfortunately, NPM needs a fake authToken to allow publishing to Verdaccio.
     * See https://twitter.com/verdaccio_npm/status/1357798427283910660?s=21.
     * That's why we create a temporary .npmrc file with the registry and a fake authToken set.
     */
    await fs.promises.writeFile(
      PATHS.PACKAGE_ROOT_NPMRC,
      `
registry=http://localhost:${verdaccioPort}/
//localhost:${verdaccioPort}/:_authToken=fake
    `,
      { encoding: 'utf8' },
    );

    // Publish to Verdaccio
    $.cwd = PATHS.PACKAGE_ROOT_DIRECTORY;
    await $`npm publish`;
  } finally {
    // Remove temporary .npmrc file
    await fs.promises.rm(PATHS.PACKAGE_ROOT_NPMRC);
  }
}

try {
  const { verdaccioPort } = await startVerdaccioServer();
  await publishToVerdaccio(verdaccioPort);
} finally {
  await fs.promises.rm(PATHS.VERDACCIO_TEMP_FOLDER, { recursive: true });
}

/*
 * TODO
 * - publish tiny-invariant to Verdaccio
 * - run different scenarios which pull that package from Verdaccio and do a build or run with it (e.g. Node CJS Run; Node ESM Run; TypeScript CJS Compile; ...)
 */
