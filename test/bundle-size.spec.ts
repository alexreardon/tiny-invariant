// @flow
import { rollup, Plugin } from 'rollup';
import { terser } from 'rollup-plugin-terser';
// ts-jest was giving me some grief so I needed to move to the require syntax here
const typescript = require('@rollup/plugin-typescript');
const replace = require('@rollup/plugin-replace');

const expectedDevSize = 207;
const expectedProdSize = 80;

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
      typescript({module: 'ESNext'}),
      replace({ 'process.env.NODE_ENV': JSON.stringify(mode), preventAssignment: true }),
      mode === 'production' ? terser() : null,
    ].filter(Boolean),
  });
  const result = await bundle.generate({ format: 'esm' });
  return result.output[0].code;
};

let dev: string = '';
let prod: string = '';

beforeAll(async () => {
  dev = await getCode({ mode: 'development' });
  prod = await getCode({ mode: 'production' });
}, 30000);

it(`development mode size should be ${expectedDevSize}kb`, () => {
  expect(dev.length).toBe(expectedDevSize);
});

it(`production mode size should be ${expectedProdSize}kb`, () => {
  expect(prod.length).toBe(expectedProdSize);
});

const containsDevCode = (code: string): boolean => {
  return code.includes(`throw new Error(prefix + ": " + (message || ''))`);
};

const containsProdCode = (code: string): boolean => {
  // prefix variable is inlined by terser
  return code.includes(`throw new Error("Invariant failed")`);
};

it('should include the message in dev builds', () => {
  expect(containsDevCode(dev)).toBe(true);
  expect(containsProdCode(dev)).toBe(false);
});

it('not should include the message in prod builds', () => {
  expect(containsDevCode(prod)).toBe(false);
  expect(containsProdCode(prod)).toBe(true);
});
