'use strict'

const fs = require('fs')
const path = require('path')
const through = require('through2')
const PluginError = require('plugin-error')

const PLUGIN_NAME = 'gulp-source-injector'

const inject = () => {
  return through.obj((file, _, callback) => {
    if (file.isNull()) {
      return callback(null, file)
    }

    if (file.isStream()) {
      return callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'))
    }

    const regex = /[\t ]*(?:<!--|\/\*)\s*?inject:\s*?([^\s].+?)\s*?(?:-->|\*\/)/gi

    const newFileContents = String(file.contents).replace(regex, (g0, src) => {
      const prefix = g0.match(/^[\t ]*/)[0] || ''
      const sourcePath = src.startsWith('/')
        ? path.join(process.cwd(), src)
        : path.join(file.dirname, src)
      const content = String(fs.readFileSync(sourcePath))
      return content
        .split('\n')
        .map(line =>
          line && line.trim() ? prefix + line : line.endsWith('\r') ? '\r' : ''
        )
        .join('\n')
    })

    file.contents = Buffer.from(newFileContents)
    callback(null, file)
  })
}

module.exports = inject
