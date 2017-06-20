const assert = require('assert')
const fs = require('fs-extra')
const path = require('path')
const {
  glob
} = require('glob-gitignore')
const { EventEmitter } = require('events')


const REGEX_IS_GLOB_FILE = /[^\/]$/

module.exports = class Scaffold extends EventEmitter {
  constructor ({
    render,
    override = true,
    backup = true,
    data,
    ignore
  } = {}) {
    super()

    assert(render && typeof render === 'function',
      'options.render must be a function.')
    assert(Object(data) === data, 'options.data must be an object.')

    this._render = render
    this._override = override
    this._backup = backup
    this._data = data
    this._ignore = ignore
  }

  copy (from, to) {
    if (Object(from) === from) {
      return this._copyFiles(from)
    }

    return this._copy(from, to)
  }

  async _copy (from, to) {
    const stat = await fs.stat(from)
    if (stat.isDirectory()) {
      return this._copyDir(from, to)
    }

    return fs.stat(to)
    .then(
      stat => {
        if (stat.isDirectory()) {
          // Only substitute path when `to` is not explicitly specified.
          const name = this._to(path.basename(from))
          to = path.join(to, name)
        }

        return this._copyFile(from, to)
      },

      () => this._copyFile(from, to)
    )
  }

  async _copyDir (from, to) {
    const files = await this._globDir(from)
    const map = {}

    files.forEach(file => {
      const file_from = path.join(from, file)
      const file_to = path.join(to, file)

      // Only substitute path when `to` is not explicitly specified.
      map[file_from] = this._to(file_to)
    })

    return this._copyFiles(map)
  }

  async _globDir (root) {
    const options = {
      cwd: root,
      dot: true,
      // Then, the dirs in `files` will end with a slash `/`
      mark: true
    }

    if (this._ignore) {
      options.ignore = this._ignore
    }

    const files = await glob('**/*', options)
    return files.filter(REGEX_IS_GLOB_FILE.test, REGEX_IS_GLOB_FILE)
  }

  _copyFiles (map) {
    const tasks = Object.keys(map).map(from => {
      const to = map[from]
      return this._copyFile(from, to)
    })

    return Promise.all(tasks)
  }

  // Substitute filename
  _to (to) {
    return this._render(to, this._data)
  }

  async _readAndTemplate (path) {
    const content = await fs.readFile(path)
    return this._render(content.toString(), this._data)
  }

  async write (to, template) {
    const override = await this._shouldOverride(to)
    if (!override) {
      return
    }

    const content = this._render(template, this._data)
    return fs.outputFile(to, content)
  }

  async _copyFile (from, to) {
    const override = await this._shouldOverride(to)
    if (!override) {
      return
    }

    const content = await this._readAndTemplate(from)
    const stat = await fs.stat(from)
    return fs.outputFile(to, content, {
      mode: stat.mode
    })
  }

  _shouldOverride (file) {
    const override = this._override
    const backup = this._backup

    return fs.exists(file)
    .then(exists => {
      // File not exists
      if (!exists) {
        return true
      }

      // Exists, and not override
      if (!override) {
        return false
      }

      // Exists, override, and need not to create backup
      if (!backup) {
        return true
      }

      const backFile = file + '.bak'
      return fs.copy(file, backFile)
      .then(() => true)
    })
  }
}
