import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

const input = 'src/tiny-invariant.ts';

export default [
  // ESM build
  {
    input,
    output: {
      file: 'dist/tiny-invariant.esm.js',
      format: 'esm',
    },
    plugins: [typescript()],
  },
  // CommonJS build
  {
    input,
    output: {
      file: 'dist/tiny-invariant.cjs.js',
      format: 'cjs',
    },
    plugins: [typescript()],
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
      // Setting development env before running typescript
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
      typescript(),
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
      // Setting development env before running typescript
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      typescript(),
      terser(),
    ],
  },
];
