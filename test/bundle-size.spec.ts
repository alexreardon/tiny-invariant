// @flow
import { rollup, Plugin } from 'rollup';
import { terser } from 'rollup-plugin-terser';
// ts-jest was giving me some grief so I needed to move to the require syntax here
const typescript = require('@rollup/plugin-typescript');
const replace = require('@rollup/plugin-replace');

const DEV_SIZE = 200;
const PROD_SIZE = 72;

const getCode = async ({
  mode,
  plugins = [],
}: {
  mode: string;
  plugins?: Plugin[];
}): Promise<string> => {
  const bundle = await rollup({
    input: 'src/tiny-invariant.ts',
    plugins: [
      replace({ 'process.env.NODE_ENV': JSON.stringify(mode) }),
      typescript(),
      ...plugins,
    ],
  });
  const result = await bundle.generate({ format: 'esm' });
  return result.output[0].code;
};

it(`development mode size should be ${DEV_SIZE}`, async () => {
  const code: string = await getCode({ mode: 'development' });
  expect(code.length).toBe(DEV_SIZE);
});

it(`production mode size should be ${PROD_SIZE}`, async () => {
  const code: string = await getCode({
    mode: 'production',
    plugins: [terser()],
  });
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
