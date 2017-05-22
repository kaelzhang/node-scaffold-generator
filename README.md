[![NPM version](https://badge.fury.io/js/scaffold-generator.svg)](http://badge.fury.io/js/scaffold-generator)
[![Build Status](https://travis-ci.org/kaelzhang/node-scaffold-generator.svg?branch=master)](https://travis-ci.org/kaelzhang/node-scaffold-generator)

# scaffold-generator

Scaffold-generator is a scaffolding utility used to automate project creation from the specified template and data.

Scaffold-generator could be the core utility to create something like grunt-init and yeoman generators.

`rename.json` of grunt-init is silly and scaffold-generator use template engine for both file content and file name.

You are free to safely copy several sources to their destinations with one single scaffold-generator instance!

## Installation

```bash
npm install scaffold-generator --save
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
  - **override** `Boolean=false` whether should override existing files
  - **backup** `Boolean=true` if `backup:true`, a `.bak` file will be saved when overriding an existing file.

Creates an instance of scaffold-generator

### .copy(from, to)
### .copy(fileMap)

- **from** `path` see ['cases'](#cases) section
- **to** `path` see ['cases'](#cases) section
- **fileMap** `Object` the `{from: to}` object

This method will still substitute the content and the pathname of template files with `options.data`.

Returns `Promise`

#### Cases

##### .copy(src_dir, dest_dir)

Will try to copy all contents of `src_dir`(not `src_dir` itself) to `dest_dir`

##### .copy(src_file, dest_file)

Will try to write to `dest_file` with the substituted content of `src_file`

##### .copy(src_file, dest_dir)

Will try to copy `src_file` into `dest_dir`


### .write(to, template)

Writes file `to` with rendered `template` if `options.override` is `true`.

