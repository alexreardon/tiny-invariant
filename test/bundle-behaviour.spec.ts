// @flow
import { rollup, Plugin } from 'rollup';
import { terser } from 'rollup-plugin-terser';
// ts-jest was giving me some grief so I needed to move to the require syntax here
const typescript = require('@rollup/plugin-typescript');
const replace = require('@rollup/plugin-replace');

jest.setTimeout(30000);

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
      replace({ 'process.env.NODE_ENV': JSON.stringify(mode), preventAssignment: true }),
      typescript({module: 'ESNext'}),
    ],
  });
  const result = await bundle.generate({ format: 'esm' });
  return result.output[0].code;
};

const devOnlyString: string = `typeof message === 'function' ? message() : message`;


it('should include the message in dev builds', async () => {
  const code = await getCode({ mode: 'development' });

  expect(code).toContain(devOnlyString);
});

it('not should include the message in prod builds', async () => {
  const code = await getCode({ mode: 'production' });

  expect(code).not.toContain(devOnlyString);
});
