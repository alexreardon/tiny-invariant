import type { Config } from '@verdaccio/types';
import YAML from 'js-yaml';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import * as verdaccio from 'verdaccio';
import { $, ProcessOutput } from 'zx';

import { fsUtil } from './helpers/fs-util.mjs';
import { networkUtil } from './helpers/network-util.mjs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const PATHS = {
  PACKAGE_ROOT_DIRECTORY: path.join(__dirname, '..'),
  PACKAGE_ROOT_NPMRC: path.join(__dirname, '..', '.npmrc'),
  VERDACCIO_CONFIG: path.join(__dirname, 'verdaccio-config.yaml'),
  VERDACCIO_TEMP_FOLDER: path.join(__dirname, '.verdaccio'),
  VERDACCIO_TEMP_FOLDER_CACHE: path.join(__dirname, '.verdaccio', 'cache'),
  VERDACCIO_TEMP_FOLDER_STORAGE: path.join(__dirname, '.verdaccio', 'storage'),
  SCENARIOS_DIRECTORY: path.join(__dirname, 'scenarios'),
} as const;

const logger = {
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

async function runScenarios(verdaccioPort: number) {
  let scenarioDirectories = await fs.promises.readdir(PATHS.SCENARIOS_DIRECTORY, {
    withFileTypes: true,
  });
  scenarioDirectories = scenarioDirectories.filter((dirent) => dirent.isDirectory());

  for (const scenarioDirectory of scenarioDirectories) {
    const pathToDirectory = path.join(PATHS.SCENARIOS_DIRECTORY, scenarioDirectory.name);
    const pathToNpmrcFile = path.join(pathToDirectory, '.npmrc');
    const lines = [
      `registry=http://localhost:${verdaccioPort}/`,
      `//localhost:${verdaccioPort}/:_authToken=fake`,
    ];
    const npmrcContent = lines.join('\n');
    await fs.promises.writeFile(pathToNpmrcFile, npmrcContent, { encoding: 'utf8' });

    $.cwd = pathToDirectory;
    await $`npm install --package-lock=false`;
    try {
      await $`npm run execute-scenario`;
    } catch (err) {
      if (err instanceof ProcessOutput) {
        logger.error(`scenario failed! rethrowing error...`);
      } else {
        logger.error(`unexpected error occured!`);
      }

      throw err;
    }
  }
}

let verdaccioServer;
try {
  // remove .verdaccio folder (could be present from a previous run)
  const verdaccioFolderExists = await fsUtil.checkIfDirentExists(PATHS.VERDACCIO_TEMP_FOLDER);
  if (verdaccioFolderExists) {
    await fs.promises.rm(PATHS.VERDACCIO_TEMP_FOLDER, { recursive: true });
  }

  // start verdaccio and publish tiny-invariant to it
  verdaccioServer = await startVerdaccioServer();
  await publishToVerdaccio(verdaccioServer.port);

  // run the scenarios
  await runScenarios(verdaccioServer.port);
} finally {
  // in case we started a verdaccio server, stop it
  if (verdaccioServer) {
    await verdaccioServer.closeServer();
  }

  // clean up
  await fs.promises.rm(PATHS.VERDACCIO_TEMP_FOLDER, { recursive: true });
}
