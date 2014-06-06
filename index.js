'use strict';

module.exports = scaffold;
function scaffold (options) {
  options = scaffold.checkOptions(options);
  return new Scaffold(options);
}

scaffold.checkOptions = function (options) {
  options || (options = {});
  options.data || (options.data = {});
  options.renderer || (options.renderer = ejs);

  if (typeof options.renderer.render !== 'function') {
    throw new Error('`options.renderer.render` is not a function');
  }

  return options;
};


var fse = require('fs-extra');
var glob = require('glob');
var ejs = require('ejs-harmony');
var async = require('async');

var fs = require('fs');
var node_path = require('path');

// @param {Object} options
// - data {Object} the data object to be applied to the template
// - renderer {Object}
// - override {Boolean=false} whether should override existing files
// - noBackup {Boolean=false} if override an existing file, a .bak file will be saved
function Scaffold(options, callback) {
  this.options = options;
};


Scaffold.prototype.copy = function(from, to, callback) {
  if (Object(from) === from) {
    var file_map = from;
    callback = to;
    return this._copyFiles(file_map, callback);
  }

  return this._copy(from, to, callback);
};


Scaffold.prototype.write = function(to, template, callback) {
  var renderer = this.options.renderer;
  var data = this.options.data;
  to = renderer.render(to, data);
  this._shouldOverride(to, this.options.override, function (override) {
    if (!override) {
      return callback(null);
    }

    var content = renderer.render(template, data);
    fse.outputFile(to, content, callback);
  });
};


Scaffold.prototype._copy = function(from, to, callback) {
  var self = this;
  fs.stat(from, function (err, stat) {
    if (err) {
      return callback(err);
    }

    if (stat.isDirectory()) {
      return self._copyDir(from, to, callback);
    }

    // copy file
    fs.stat(to, function (err, stat) {
      if (!err && stat.isDirectory()) {
        var name = node_path.basename(from);
        to = node_path.join(to, name);
      }

      // If error, maybe `to` is not exists, we just try to copy.
      return self._copyFile(from, to, callback);
    });
  });
};


Scaffold.prototype._copyDir = function(from, to, callback) {
  var self = this;
  this._globDir(from, function (err, files) {
    if (err) {
      return callback(err);
    }

    var map = {};
    files.forEach(function (file) {
      var file_from = node_path.join(from, file);
      var file_to = node_path.join(to, file);
      map[file_from] = file_to;
    });
    
    self._copyFiles(map, callback);
  });
};


var REGEX_FILE = /[^\/]$/;
Scaffold.prototype._globDir = function (root, callback) {
  glob('**/*', {
    cwd: root,
    dot: true,
    // Then, the dirs in `files` will end with a slash `/`
    mark: true
  }, function (err, files) {
    if (err) {
      return callback(err);
    }

    files = files.filter(REGEX_FILE.test, REGEX_FILE);
    callback(null, files);
  });
};


// @param {Array} files relative files
// @param {Object} options
// - from {path}
// - to {path}
Scaffold.prototype._copyFiles = function(file_map, callback) {
  var self = this;
  async.each(Object.keys(file_map), function (from, done) {
    var to = file_map[from];
    self._copyFile(from, to, done);

  }, function (err) {
    callback(err || null);
  });
};


// Params same as `_copyFiles`
// @param {path} from absolute path
// @param {path} to absolute path
Scaffold.prototype._copyFile = function (from, to, callback) {
  var data = this.options.data;
  var renderer = this.options.renderer;
  // substitute file name
  to = renderer.render(to, data);
  var self = this;
  self._shouldOverride(to, this.options.override, function (override) {
    if (!override) {
      return callback(null);
    }

    self._readAndTemplate(from, data, function (err, content) {
      if (err) {
        return callback(err);
      }

      fse.outputFile(to, content, callback);
    });
  });
};


Scaffold.prototype._shouldOverride = function (file, override, callback) {
  var bak = !this.options.noBackup;
  fs.exists(file, function (exists) {
    if (exists) {
      if (override) {
        if (bak) {
          var bak_file = file + '.bak';
          // Save a '.bak' file
          return fse.copy(file, bak_file, function () {
            callback(true);
          });

        } else {
          return callback(true);
        }
        
      } else {
        return callback(false);
      }
    }

    callback(true);
  });
};


// Reads file and substitute with the data
Scaffold.prototype._readAndTemplate = function (path, data, callback) {
  var renderer = this.options.renderer;
  fs.readFile(path, function (err, content) {
    if (err) {
      return callback(err);
    }

    content = renderer.render(content.toString(), data);
    callback(null, content);
  });
};
