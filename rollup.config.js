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
    plugins: [typescript({ module: 'ESNext' })],
  },
  // CommonJS build
  {
    input,
    output: {
      file: 'dist/tiny-invariant.cjs.js',
      format: 'cjs',
      exports: 'default',
    },
    plugins: [typescript({ module: 'ESNext' })],
  },
  // UMD: Production build
  {
    input,
    output: {
      file: 'dist/tiny-invariant.js',
      format: 'umd',
      name: 'invariant',
    },
    plugins: [typescript({ module: 'ESNext' })],
  },
  {
    input,
    output: {
      file: 'dist/tiny-invariant.min.js',
      format: 'umd',
      name: 'invariant',
    },
    plugins: [
      typescript({ module: 'ESNext' }),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production'), preventAssignment: true }),
      terser(),
    ],
  },
];
