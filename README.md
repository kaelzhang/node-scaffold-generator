# scaffold-generator [![NPM version](https://badge.fury.io/js/scaffold-generator.svg)](http://badge.fury.io/js/scaffold-generator) [![Build Status](https://travis-ci.org/kaelzhang/node-scaffold-generator.svg?branch=master)](https://travis-ci.org/kaelzhang/node-scaffold-generator) [![Dependency Status](https://gemnasium.com/kaelzhang/node-scaffold-generator.svg)](https://gemnasium.com/kaelzhang/node-scaffold-generator)

Scaffold-generator is a scaffolding utility used to automate project creation from the specified template and data.

Scaffold-generator could be the core utility to create something like grunt-init and [cortex](https://github.com/cortexjs/cortex)-init.

## Installation

```bash
npm install scaffold-generator --save
```

## Usage

Suppose the file structure is:

```
/path/from
         |-- <%=main%>.js // default to ejs template
         |-- package.json
```

And /path/from/package.json:

```json
{
  "name": "<%= name %>",
  "main": "<%= main %>"
}
```

```js
var scaffold = require('scaffold-generator');
scaffold({
  data: {
    name: 'cortex',
    main: 'lib/index.js'
  }
}).generate('/path/from', '/path/to', function(err){
  // suppose `err` is null
});
```

THen,

```
/path/to
       |-- lib
       |     |-- index.js
       |-- package.json
```

And /path/to/package.json

```json
{
  "name": "cortex",
  "main": "lib/index.js"
}
```


## scaffold(options)

- options `Object` 
    - data `Object` the data which will be substituted into the template file.
    - renderer `Object=ejs` the renderer to compile the template and apply data. The default renderer is [`ejs`](http://www.npmjs.org/package/ejs) created by TJ.
    - override `Boolean='false'` whether should override existing files

Creates an instance of scaffold-generator

### .generate(fileMap, callback)

- fileMap `Object` the hashmap of `<from>: <to>`. See the example above for details to get a better understanding.
- callback `function(err)`
- err `Error`

Generates the scaffold.

Scaffold-generator never cares file renaming which you could deal with ahead of time.

### .generate(from, to, callback)

- from `dir`
- to `dir`
- callback `function(err)`
- err `Error`

If there is no path renaming, you could simply use this method instead of `.generate(fileMap, callback)` to copy the template folder to the destination.

This method will still substitute the content of template files with `options.data`.


