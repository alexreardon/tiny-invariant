import fs from 'node:fs';
import path from 'node:path';
import { $ } from 'zx';
import { it } from 'vitest';

import { PATHS } from './helpers/constants.mjs';

if (!process.env.VERDACCIO_PORT) {
  throw new Error(`VERDACCIO_PORT is not defined`);
}
const verdaccioPort = Number(process.env.VERDACCIO_PORT);

let scenarioDirectories = fs.readdirSync(PATHS.SCENARIOS_DIRECTORY, {
  withFileTypes: true,
});
scenarioDirectories = scenarioDirectories.filter((dirent) => dirent.isDirectory());

for (const scenarioDirectory of scenarioDirectories) {
  it(`scenario "${scenarioDirectory.name}"`, async () => {
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
      throw err;
    }
  });
}
