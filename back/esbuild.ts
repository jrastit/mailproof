import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    minify: false,
    keepNames: true,
    sourcemap: true,
    sourceRoot: 'src',
    sourcesContent: false,
    outdir: 'build',
    outExtension: {
        '.js': '.mjs',
    },
    banner: {
        js: `
const { require, __filename, __dirname } = await (async () => {
  const { createRequire } = await import('node:module');
  const { fileURLToPath, URL } = await import('node:url');
  return {
    require: createRequire(import.meta.url),
    __filename: fileURLToPath(import.meta.url),
    __dirname: fileURLToPath(new URL('.', import.meta.url)),
  };
})();
`,
    },
});
