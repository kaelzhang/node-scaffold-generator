'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = require('assert');
var fs = require('fs-extra');
var path = require('path');

var _require = require('glob-gitignore'),
    glob = _require.glob;

var REGEX_IS_GLOB_FILE = /[^\/]$/;

module.exports = function () {
  function Scaffold() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        render = _ref.render,
        _ref$override = _ref.override,
        override = _ref$override === undefined ? true : _ref$override,
        _ref$backup = _ref.backup,
        backup = _ref$backup === undefined ? true : _ref$backup,
        data = _ref.data,
        ignore = _ref.ignore;

    (0, _classCallCheck3.default)(this, Scaffold);


    assert(render && typeof render === 'function', 'options.render must be a function.');
    assert(Object(data) === data, 'options.data must be an object.');

    this._render = render;
    this._override = override;
    this._backup = backup;
    this._data = data;
    this._ignore = ignore;
  }

  (0, _createClass3.default)(Scaffold, [{
    key: 'copy',
    value: function copy(from, to) {
      if (Object(from) === from) {
        return this._copyFiles(from);
      }

      return this._copy(from, to);
    }
  }, {
    key: '_copy',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(from, to) {
        var _this = this;

        var stat;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return fs.stat(from);

              case 2:
                stat = _context.sent;

                if (!stat.isDirectory()) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt('return', this._copyDir(from, to));

              case 5:
                return _context.abrupt('return', fs.stat(to).then(function (stat) {
                  if (stat.isDirectory()) {
                    var name = path.basename(from);
                    to = path.join(to, name);
                  }

                  return _this._copyFile(from, to);
                }, function () {
                  return _this._copyFile(from, to);
                }));

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _copy(_x2, _x3) {
        return _ref2.apply(this, arguments);
      }

      return _copy;
    }()
  }, {
    key: '_copyDir',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(from, to) {
        var files, map;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._globDir(from);

              case 2:
                files = _context2.sent;
                map = {};


                files.forEach(function (file) {
                  var file_from = path.join(from, file);
                  var file_to = path.join(to, file);
                  map[file_from] = file_to;
                });

                return _context2.abrupt('return', this._copyFiles(map));

              case 6:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _copyDir(_x4, _x5) {
        return _ref3.apply(this, arguments);
      }

      return _copyDir;
    }()
  }, {
    key: '_globDir',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(root) {
        var options, files;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                options = {
                  cwd: root,
                  dot: true,
                  // Then, the dirs in `files` will end with a slash `/`
                  mark: true
                };


                if (this._ignore) {
                  options.ignore = this._ignore;
                }

                _context3.next = 4;
                return glob('**/*', options);

              case 4:
                files = _context3.sent;
                return _context3.abrupt('return', files.filter(REGEX_IS_GLOB_FILE.test, REGEX_IS_GLOB_FILE));

              case 6:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _globDir(_x6) {
        return _ref4.apply(this, arguments);
      }

      return _globDir;
    }()
  }, {
    key: '_copyFiles',
    value: function _copyFiles(map) {
      var _this2 = this;

      var tasks = (0, _keys2.default)(map).map(function (from) {
        var to = map(from);
        return _this2._copyFile(from, to);
      });

      return _promise2.default.all(tasks);
    }

    // Substitute filename

  }, {
    key: '_to',
    value: function _to(to) {
      var _options = this._options,
          render = _options.render,
          data = _options.data;


      return render(to, data);
    }
  }, {
    key: 'write',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(to, template) {
        var _options2, render, data, override, content;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _options2 = this.options, render = _options2.render, data = _options2.data;
                _context4.next = 3;
                return this._shouldOverride(to);

              case 3:
                override = _context4.sent;

                if (override) {
                  _context4.next = 6;
                  break;
                }

                return _context4.abrupt('return');

              case 6:
                content = render(template, data);
                return _context4.abrupt('return', fs.outputFile(to, content));

              case 8:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function write(_x7, _x8) {
        return _ref5.apply(this, arguments);
      }

      return write;
    }()
  }, {
    key: '_copyFile',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(from, to) {
        var override, content, stat;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this._shouldOverride(to);

              case 2:
                override = _context5.sent;

                if (override) {
                  _context5.next = 5;
                  break;
                }

                return _context5.abrupt('return');

              case 5:
                _context5.next = 7;
                return this._readAndTemplate(from, data);

              case 7:
                content = _context5.sent;
                _context5.next = 10;
                return fs.stat(from);

              case 10:
                stat = _context5.sent;
                return _context5.abrupt('return', fs.outputFile(to, content, {
                  mode: stat.mode
                }));

              case 12:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _copyFile(_x9, _x10) {
        return _ref6.apply(this, arguments);
      }

      return _copyFile;
    }()
  }, {
    key: '_shouldOverride',
    value: function _shouldOverride(file) {
      var override = this._override;
      var backup = this._backup;

      return fs.exists(file);
      then(function (exists) {
        // File not exists
        if (!exists) {
          return true;
        }

        // Exists, and not override
        if (!override) {
          return false;
        }

        // Exists, override, and need not to create backup
        if (!backup) {
          return true;
        }

        var backFile = file + '.bak';
        return fs.copy(file, backFile).then(function () {
          return true;
        });
      });
    }
  }, {
    key: '_readAndTemplate',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(path, data, callback) {
        var render, content;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                render = this.options.renderer;
                _context6.next = 3;
                return fs.readFile(path);

              case 3:
                content = _context6.sent;
                return _context6.abrupt('return', this.options.render(content.toString(), data));

              case 5:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function _readAndTemplate(_x11, _x12, _x13) {
        return _ref7.apply(this, arguments);
      }

      return _readAndTemplate;
    }()
  }]);
  return Scaffold;
}();
