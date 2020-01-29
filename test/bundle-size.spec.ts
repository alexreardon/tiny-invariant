// @flow
import { rollup, Plugin } from 'rollup';
import { terser } from 'rollup-plugin-terser';
// ts-jest was giving me some grief so I needed to move to the require syntax here
const typescript = require('@rollup/plugin-typescript');
const replace = require('@rollup/plugin-replace');

const DEV_SIZE = 265;
const PROD_SIZE = 129;

const getCode = async ({
  mode,
}: {
  mode: 'development' | 'production';
}): Promise<string> => {
  const bundle = await rollup({
    input: 'src/tiny-invariant.ts',
    output: {
      format: 'esm',
    },
    plugins: [
      typescript(),
      replace({ 'process.env.NODE_ENV': JSON.stringify(mode) }),
      mode === 'production' ? terser() : null,
    ].filter(Boolean),
  });
  const result = await bundle.generate({ format: 'esm' });
  return result.output[0].code;
};

let dev: string;
let prod: string;

beforeAll(async () => {
  dev = await getCode({ mode: 'development' });
  prod = await getCode({ mode: 'production' });
});

it(`development mode size should be ${DEV_SIZE}kb`, async () => {
  expect(dev.length).toBe(DEV_SIZE);
});

it(`production mode size should be ${PROD_SIZE}kb`, async () => {
  expect(prod.length).toBe(PROD_SIZE);
});

const containsDevCode = (code: string) => {
  return code.includes(`throw new Error(prefix + ": " + (message || ''))`);
};

const containsProdCode = (code: string) => {
  // prefix variable is inlined by terser
  return code.includes(`throw new Error("Invariant failed")`);
};

it('should include the message in dev builds', async () => {
  expect(containsDevCode(dev)).toBe(true);
  expect(containsProdCode(dev)).toBe(false);
});

it('not should include the message in prod builds', async () => {
  expect(containsDevCode(prod)).toBe(false);
  expect(containsProdCode(prod)).toBe(true);
});
