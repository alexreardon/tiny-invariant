import fs from 'node:fs';

export const fsUtil = {
  checkIfDirentExists,
};

async function checkIfDirentExists(path: string): Promise<boolean> {
  try {
    await fs.promises.stat(path);
    return true;
  } catch (err: unknown) {
    if (isFSDirentNotFoundError(err)) {
      return false;
    }

    // Some unexpected error was thrown --> rethrow
    throw err;
  }
}

type FSDirentNotFoundError = {
  code: 'ENOENT';
};

function isFSDirentNotFoundError(err: unknown): err is FSDirentNotFoundError {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { [prop in string]?: unknown }).code === 'ENOENT'
  );
}
