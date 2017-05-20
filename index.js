const assert = require('assert')
const fs = require('fs-promise')
const path = require('path')
const glob = require('globby')


const REGEX_IS_GLOB_FILE = /[^\/]$/

module.exports = class scaffold {
  constructor ({
    render,
    override = true,
    backup = true,
    data
  } = {}) {

    assert(render && typeof render === 'function',
      'options.render must be a function.')
    assert(Object(data) === data, 'options.data must be a function.')

    this._render = render
    this._override = override
    this._backup = backup,
    this._data = data
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
          const name = path.basename(from)
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

    files.forEach(function (file) {
      const file_from = path.join(from, file)
      const file_to = path.join(to, file)
      map[file_from] = file_to
    })

    return this._copyFiles(map)
  }

  async _globDir (root) {
    const files = await glob('**/*', {
      cwd: root,
      dot: true,
      ignore: this.options.ignore,
      // Then, the dirs in `files` will end with a slash `/`
      mark: true
    })

    return files.filter(REGEX_IS_GLOB_FILE.test, REGEX_IS_GLOB_FILE)
  }

  _copyFiles (map) {
    const tasks = Object.keys(map).map(from => {
      const to = map(from)
      return this._copyFile(from, to)
    })

    return Promise.all(tasks)
  }

  // Substitute filename
  _to (to) {
    const {
      render,
      data
    } = this._options

    return render(to, data)
  }

  async write (to, template) {
    const {
      render,
      data
    } = this.options

    const override = await this._shouldOverride(to)
    if (!override) {
      return
    }

    const content = render(template, data)
    return fs.outputFile(to, content)
  }

  async _copyFile (from, to) {
    const override = await this._shouldOverride(to)
    if (!override) {
      return
    }

    const content = await this._readAndTemplate(from, data)
    const stat = await fs.stat(from)
    return fs.outputFile(to, content, {
      mode: stat.mode
    })
  }

  _shouldOverride (file) {
    const override = this._override
    const backup = this._backup

    return fs.exists(file)
    then(exists => {

    })


    , function (exists) {
      if (exists) {
        if (override) {
          if (!noBackup) {
            var bak_file = file + '.bak'
            // Save a '.bak' file
            return fse.copy(file, bak_file, function () {
              callback(true)
            })

          } else {
            return callback(true)
          }

        } else {
          return callback(false)
        }
      }

      callback(true)
    })
  }

  async _readAndTemplate (path, data, callback) {
    var render = this.options.renderer
    const content = await fs.readFile(path)
    return this.options.render(content.toString(), data)
  }
}
