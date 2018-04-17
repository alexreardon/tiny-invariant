import babel from 'rollup-plugin-babel';

const input = 'src/index.js';

const babelOptions = {
  // only transpile our source code
  exclude: 'node_modules/**',
};

export default [
  // ESM build
  {
    input,
    output: {
      file: 'dist/tiny-invariant.esm.js',
      format: 'es',
    },
    plugins: [babel()],
  },
  // CommonJS build
  {
    input,
    output: {
      file: 'dist/tiny-invariant.cjs.js',
      format: 'cjs',
    },
    plugins: [babel()],
  },
];
