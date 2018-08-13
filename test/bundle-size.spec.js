// @flow
import { rollup } from 'rollup';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';

const DEV_SIZE = 205;
const PROD_SIZE = 180;

const getCode = async ({ mode }): Promise<string> => {
  const bundle = await rollup({
    input: './src/index.js',
    output: {
      format: 'esm',
    },
    plugins: [
      babel({
        babelrc: false,
        presets: ['flow', ['env', { modules: false, loose: true }]],
        comments: false,
      }),
      replace({ 'process.env.NODE_ENV': JSON.stringify(mode) }),
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

const containsMessage = (code: string) => {
  return code.includes(`throw new Error(prefix + ': ' + (message || ''))`);
};

it('should include the message in dev builds', async () => {
  const code: string = await getCode({ mode: 'development' });
  expect(containsMessage(code)).toBe(true);
});

it('not should include the message in prod builds', async () => {
  const code: string = await getCode({ mode: 'production' });
  expect(containsMessage(code)).toBe(false);
});
