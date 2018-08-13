import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
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
  // UMD: Production build
  {
    input,
    output: {
      file: 'dist/tiny-invariant.js',
      format: 'umd',
      name: 'invariant',
    },
    plugins: [
      // Setting development env before running babel etc
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
      babel(),
    ],
  },
  {
    input,
    output: {
      file: 'dist/tiny-invariant.min.js',
      format: 'umd',
      name: 'invariant',
    },
    plugins: [
      // Setting development env before running babel etc
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      babel(),
      uglify(),
    ],
  },
];
