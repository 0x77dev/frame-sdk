import dts from 'bun-plugin-dts'

await Bun.build({
  entrypoints: [
    './src/index.ts',
    './src/errors.ts',
    './src/transport/noble.ts',
    './src/transport/schema.ts',
    './src/transport/constants.ts'
  ],
  splitting: true,
  outdir: './dist',
  minify: true,
  external: ['@abandonware/noble', 'webbluetooth'],
  packages: 'external',
  sourcemap: 'linked',
  plugins: [dts()]
})
