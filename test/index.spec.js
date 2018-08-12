// @flow
import invariant from '../src';
import { rollup } from 'rollup';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';

const DEV_SIZE = 426;
const PROD_SIZE = 431;

const getSizeInMode = async ({ mode }) => {
  const bundle = await rollup({
    input: './src/index.js',
    output: {
      format: 'esm',
    },
    plugins: [
      babel({
        babelrc: false,
        presets: ['flow', ['env', { modules: false, loose: true }]],
      }),
      replace({ 'process.env.NODE_ENV': JSON.stringify(mode) }),
    ],
  });
  const { code } = await bundle.generate({ format: 'esm' });
  return code.length;
};

it('should not throw if condition is truthy', () => {
  const truthy: mixed[] = [1, -1, true, {}, [], Symbol(), 'hi'];
  truthy.forEach((value: mixed) =>
    expect(() => invariant(value)).not.toThrow(),
  );
});

it('should throw if the condition is falsy', () => {
  // https://github.com/getify/You-Dont-Know-JS/blob/master/types%20%26%20grammar/ch4.md#falsy-values
  const falsy: mixed[] = [undefined, null, false, +0, -0, NaN, ''];
  falsy.forEach((value: mixed) => expect(() => invariant(value)).toThrow());
});

it(`development mode size should be ${DEV_SIZE}`, async () => {
  expect(await getSizeInMode({ mode: 'development' })).toBe(DEV_SIZE);
});

it(`production mode size should be ${PROD_SIZE}`, async () => {
  expect(await getSizeInMode({ mode: 'production' })).toBe(PROD_SIZE);
});
