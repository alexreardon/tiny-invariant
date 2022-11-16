import fs from 'node:fs';

export const fsUtil = {
  checkIfFileExists,
};

async function checkIfFileExists(path: string): Promise<boolean> {
  try {
    await fs.promises.stat(path);
    return true;
  } catch (err: unknown) {
    if (isFSFileNotFoundError(err)) {
      return false;
    }

    // Some unexpected error was thrown --> rethrow
    throw err;
  }
}

type FSFileNotFoundError = {
  code: 'ENOENT';
};

function isFSFileNotFoundError(err: unknown): err is FSFileNotFoundError {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { [prop in string]?: unknown }).code === 'ENOENT'
  );
}
