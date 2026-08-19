import { build } from 'vite'

const root = process.cwd()
const outDir = 'C:/Users/Sushmit/AppData/Local/Temp/opencode/verify-dist'

await build({
  configFile: false,
  root,
  resolve: {
    alias: { '@': root + '/src' },
  },
  build: {
    outDir,
    emptyOutDir: true,
    lib: {
      entry: root + '/_verify-entry.ts',
      formats: ['es'],
      fileName: () => 'receipt-verify.js',
    },
    minify: false,
  },
})
console.log('built', outDir)
