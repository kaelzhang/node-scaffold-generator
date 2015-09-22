[![NPM version](https://badge.fury.io/js/scaffold-generator.svg)](http://badge.fury.io/js/scaffold-generator)
[![Build Status](https://travis-ci.org/kaelzhang/node-scaffold-generator.svg?branch=master)](https://travis-ci.org/kaelzhang/node-scaffold-generator)
[![Dependency Status](https://gemnasium.com/kaelzhang/node-scaffold-generator.svg)](https://gemnasium.com/kaelzhang/node-scaffold-generator)

# scaffold-generator

Scaffold-generator is a scaffolding utility used to automate project creation from the specified template and data.

Scaffold-generator could be the core utility to create something like grunt-init and [cortex](https://github.com/cortexjs/cortex)-init.

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
         |-- {%=main%} // default to ejs template
         |-- package.json
```

And /path/from/package.json:

```json
{
  "name": "{%= name %}",
  "main": "{%= main %}"
}
```

```js
var scaffold = require('scaffold-generator');
scaffold({
  data: {
    name: 'cortex',
    main: 'lib/index.js'
  }
}).copy('/path/from', '/path/to', function(err){
  // suppose `err` is null
});
```

Then,

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
    - override `Boolean=false` whether should override existing files
    - noBackup `Boolean=false` if noBackup is `false`, a `.bak` file will be saved when overriding an existing file.
    - noCheckTag `Boolean=false` if `true`, it will not check the cross-platform compatibility, such as Windows.
    - open `String='{%'` the open tag for `ejs`, default to `'{%'`
    - close `String='%}'` the close tag, default to `'%}'`

Creates an instance of scaffold-generator

### .generate(fileMap, callback)

- fileMap `Object` the hashmap of `<from>: <to>`. See the example above for details to get a better understanding.
- callback `function(err)`
- err `Error`

Generates the scaffold.

Scaffold-generator never cares file renaming which you could deal with ahead of time.

### .copy(from, to, callback)
### .copy(file_map, callback)

- from `path` see ['cases'](#cases) section
- to `path` see ['cases'](#cases) section
- file_map `Object` the `{from: to}` object
- callback `function(err)`
- err `Error`

This method will still substitute the content and the pathname of template files with `options.data`.


#### Cases

##### .copy(src_dir, dest_dir, callback)

Will try to copy all contents of `src_dir`(not `src_dir` itself) to `dest_dir`

##### .copy(src_file, dest_file, callback)

Will try to write to `dest_file` with the substituted content of `src_file`

##### .copy(src_file, dest_dir, callback)

Will try to copy `src_file` into `dest_dir`


### .write(to, template, callback);

Writes file `to` with rendered `template` if `options.override` is `true`. 

