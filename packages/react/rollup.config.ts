import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import autoExternal from 'rollup-plugin-auto-external';

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
    }
  ],
  plugins: [autoExternal(), typescript(), terser()]
};
