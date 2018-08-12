import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const input = 'src/index.js';

export default [
  // ESM build
  {
    input,
    output: {
      file: pkg.module,
      format: 'esm',
    },
    plugins: [babel()],
  },
  // CommonJS build
  {
    input,
    output: {
      file: pkg.main,
      format: 'cjs',
    },
    plugins: [babel()],
  },
];
