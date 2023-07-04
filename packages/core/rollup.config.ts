import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default {
  input: './src/index.ts',
  output: [
    {
      file: './dist/index.js',
      format: 'esm'
    },
    {
      file: './dist/index.cjs',
      format: 'cjs'
    },
    {
      file: './dist/index.umd.js',
      name: '@webaudio/core',
      format: 'umd'
    }
  ],
  external: ['standardized-audio-context'],
  plugins: [nodePolyfills(), typescript(), terser()]
};
