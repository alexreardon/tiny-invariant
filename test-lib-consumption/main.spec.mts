import fs from 'node:fs';
import path from 'node:path';
import { $ } from 'zx';
import { it } from 'vitest';

import { PATHS } from './helpers/constants.mjs';

let scenarioDirectories = fs.readdirSync(PATHS.SCENARIOS_DIRECTORY, {
  withFileTypes: true,
});
scenarioDirectories = scenarioDirectories.filter((dirent) => dirent.isDirectory());

for (const scenarioDirectory of scenarioDirectories) {
  it(`scenario "${scenarioDirectory.name}"`, async () => {
    const pathToDirectory = path.join(PATHS.SCENARIOS_DIRECTORY, scenarioDirectory.name);
    $.cwd = pathToDirectory;
    await $`npm install --package-lock=false`;
    await $`npm run execute-scenario`;
  });
}
