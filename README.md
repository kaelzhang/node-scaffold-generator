[![Build Status](https://github.com/kaelzhang/node-scaffold-generator/actions/workflows/nodejs.yml/badge.svg)](https://github.com/kaelzhang/node-scaffold-generator/actions/workflows/nodejs.yml)
[![Coverage](https://codecov.io/gh/kaelzhang/node-scaffold-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/node-scaffold-generator)

# scaffold-generator

Scaffold-generator is a scaffolding utility used to automate project creation from the specified template and data.

Scaffold-generator could be the core utility to create something like grunt-init and yeoman generators.

`rename.json` of grunt-init is silly and scaffold-generator use template engine for both file content and file name.

You are free to safely copy several sources to their destinations with one single scaffold-generator instance!

## Installation

```bash
npm i scaffold-generator --save
```

## Usage

Suppose the file structure is:

```
/path/from
         |-- {{main}}
         |-- package.json
```

And /path/from/package.json:

```json
{
  "name": "{{name}}",
  "main": "{{main}}"
}
```

```js
const Scaffold = require('scaffold-generator')
const mustache = require('mustache')

// All variables are HTML-escaped by mustache by default,
// and `lib/index.js` will be escaped to `lib&#x2F;index.js`.
// To avoid this, override the `mustache.escape`
// or triple mustache `{{{name}}}` should be used.
mustache.escape = v => v

new Scaffold({
  data: {
    name: 'my-module',
    main: 'lib/index.js'
  },
  // function `options.render` accepts `str` and `data`, then returns a `str`
  render: mustache.render
})
.copy('/path/from', '/path/to')
.then(() => {
  console.log('done')
})
```

Then:

File names will be substituted.

```
/path/to
       |-- lib
       |     |-- index.js
       |-- package.json
```

File contents will also be substitute. And the file `/path/to/package.json` will be

```json
{
  "name": "my-module",
  "main": "lib/index.js"
}
```

## new Scaffold(options)

- **options** `Object`
  - **data** `Object` the data which will be substituted into the template file.
  - **ignore** `(String|Array.<String>|Ignore)=` the ignore rule or a array of rules.
  - **render** `function(str, data): String` the renderer to compile the template and apply data.
  - **override** `Boolean=true` whether should override existing files
  - **backup** `Boolean=true` if `backup:true`, a `.bak` file will be saved when overriding an existing file.

Creates an instance of scaffold-generator

### .copy(from, to)
### .copy(filesMap)

- **from** `path` see ['cases'](#cases) section
- **to** `path` see ['cases'](#cases) section
- **filesMap** `Object` the `{from: to}` object

This method will still substitute the content and the pathname of template files with `options.data`.

`scaffold-generator` will `fs.stat` the types of `from` and `to`, and then determine what things are to be copied. See [Cases](#cases) section for details.

Returns `Promise`

### .write(to, template)

Writes file `to` with rendered `template` if `options.override` is `true`.

## Cases

### .copy(fromDir, toDir)

Will try to copy all files inside `fromDir`(not `fromDir` itself) to `toDir`, with the filenames and file contents substituted.

### .copy(fromFile, toFile)

Will try to write to `fromFile` with the substituted content of `toFile`

### .copy(fromFile, toDir)

Will try to copy file `fromFile` into directory `toDir`

