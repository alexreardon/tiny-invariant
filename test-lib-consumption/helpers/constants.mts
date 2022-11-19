import path from 'node:path';
import url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const PATHS = {
  PACKAGE_ROOT_DIRECTORY: path.join(__dirname, '..', '..'),
  VERDACCIO_TEMP_FOLDER: path.join(__dirname, '..', '.verdaccio'),
  VERDACCIO_TEMP_FOLDER_CACHE: path.join(__dirname, '..', '.verdaccio', 'cache'),
  VERDACCIO_TEMP_FOLDER_STORAGE: path.join(__dirname, '..', '.verdaccio', 'storage'),
  SCENARIOS_DIRECTORY: path.join(__dirname, '..', 'scenarios'),
} as const;
