import type { Config } from '@verdaccio/types';
import YAML from 'js-yaml';
import fs from 'node:fs';
import * as verdaccio from 'verdaccio';
import { $ } from 'zx';

import { PATHS } from './helpers/constants.mjs';
import { fsUtil } from './helpers/fs-util.mjs';
import { logger } from './helpers/logger.mjs';
import { networkUtil } from './helpers/network-util.mjs';

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
  const port = await networkUtil.getRandomFreePort();
  await new Promise<void>((resolve, reject) => {
    logger.info(`[Verdaccio] starting server on port ${port}`);
    app.listen(port, function listeningListener() {
      logger.info(`[Verdaccio] server started!`);
      resolve();
    });
    app.on('error', reject);
  });

  function closeServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      app.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  return {
    port,
    closeServer,
  };
}

async function publishToVerdaccio(verdaccioPort: number) {
  // Check if .npmrc file in the root of the package exists and if so, abort
  const npmrcExists = await fsUtil.checkIfDirentExists(PATHS.PACKAGE_ROOT_NPMRC);
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
    const lines = [
      `registry=http://localhost:${verdaccioPort}/`,
      `//localhost:${verdaccioPort}/:_authToken=fake`,
    ];
    const npmrcContent = lines.join('\n');
    await fs.promises.writeFile(PATHS.PACKAGE_ROOT_NPMRC, npmrcContent, { encoding: 'utf8' });

    // Publish to Verdaccio
    $.cwd = PATHS.PACKAGE_ROOT_DIRECTORY;
    await $`npm publish`;
  } finally {
    // Remove temporary .npmrc file
    await fs.promises.rm(PATHS.PACKAGE_ROOT_NPMRC);
  }
}

let verdaccioServer: {
  port: number;
  closeServer: () => Promise<void>;
};

export async function setup() {
  // remove .verdaccio folder (could be present from a previous run)
  const verdaccioFolderExists = await fsUtil.checkIfDirentExists(PATHS.VERDACCIO_TEMP_FOLDER);
  if (verdaccioFolderExists) {
    await fs.promises.rm(PATHS.VERDACCIO_TEMP_FOLDER, { recursive: true });
  }

  // start verdaccio and publish tiny-invariant to it
  verdaccioServer = await startVerdaccioServer();
  await publishToVerdaccio(verdaccioServer.port);

  globalThis.verdaccioPort = verdaccioServer.port;
}

export async function teardown() {
  // in case we started a verdaccio server, stop it
  if (verdaccioServer) {
    await verdaccioServer.closeServer();
  }

  // clean up
  await fs.promises.rm(PATHS.VERDACCIO_TEMP_FOLDER, { recursive: true });
}
