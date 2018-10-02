// @flow
import { rollup } from 'rollup';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';

const DEV_SIZE = 203;
const PROD_SIZE = 178;

const getCode = async ({ mode }): Promise<string> => {
  const bundle = await rollup({
    input: './src/index.js',
    plugins: [
      replace({ 'process.env.NODE_ENV': JSON.stringify(mode) }),
      babel(),
    ],
  });
  const { code } = await bundle.generate({ format: 'esm' });
  return code;
};

it(`development mode size should be ${DEV_SIZE}`, async () => {
  const code: string = await getCode({ mode: 'development' });
  expect(code.length).toBe(DEV_SIZE);
});

it(`production mode size should be ${PROD_SIZE}`, async () => {
  const code: string = await getCode({ mode: 'production' });
  expect(code.length).toBe(PROD_SIZE);
});

const containsDevCode = (code: string) => {
  return code.includes(`throw new Error(prefix + ": " + (message || ''))`);
};

const containsProdCode = (code: string) => {
  return code.includes(`throw new Error(prefix)`);
};

it('should include the message in dev builds', async () => {
  const code: string = await getCode({ mode: 'development' });
  expect(containsDevCode(code)).toBe(true);
  expect(containsProdCode(code)).toBe(false);
});

it('not should include the message in prod builds', async () => {
  const code: string = await getCode({ mode: 'production' });
  expect(containsDevCode(code)).toBe(false);
  expect(containsProdCode(code)).toBe(true);
});
