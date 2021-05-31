export default [
  {
    input: 'index.js',
    output: {
      file: 'index.cjs',
      format: 'cjs',
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
