export default [
  {
    input: 'index.mjs',
    output: {
      file: 'index.cjs',
      format: 'cjs',
      name: 'ScratchPad',
      exports: 'auto'
    },
    external: [
      'tiny-function-queue',
      'fs',
      'process',
      'os',
      'path',
      'v8'
    ]
  }
]
