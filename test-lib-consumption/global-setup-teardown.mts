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

async function publishToVerdaccio() {
  $.cwd = PATHS.PACKAGE_ROOT_DIRECTORY;
  await $`npm publish`;
}

let verdaccioServer: {
  port: number;
  closeServer: () => Promise<void>;
};

export async function setup() {
  // Remove .verdaccio folder (could be present from a previous run)
  const verdaccioFolderExists = await fsUtil.checkIfDirentExists(PATHS.VERDACCIO_TEMP_FOLDER);
  if (verdaccioFolderExists) {
    await fs.promises.rm(PATHS.VERDACCIO_TEMP_FOLDER, { recursive: true });
  }

  // Start verdaccio
  verdaccioServer = await startVerdaccioServer();

  /**
   * Publish to Verdaccio
   *
   * For that we set the registry URL to point to Verdaccio and a fake auth token (package managers cry otherwise).
   * See https://twitter.com/verdaccio_npm/status/1357798427283910660?s=21.
   *
   * These process.env variables will also be active in the test cases, so any "npm install"
   * there will fetch the dependencies from Verdaccio.
   */
  process.env.npm_config_registry = `http://localhost:${verdaccioServer.port}/`;
  process.env.npm_config__auth = `fake-auth-token`;
  await publishToVerdaccio();
}

export async function teardown() {
  // in case we started a verdaccio server, stop it
  if (verdaccioServer) {
    await verdaccioServer.closeServer();
  }

  // clean up
  await fs.promises.rm(PATHS.VERDACCIO_TEMP_FOLDER, { recursive: true });
}
