'use strict';

var expect = require('chai').expect;
var scaffold = require('../');
var fs = require('fs-sync');
var node_path = require('path');
var tmp = require('tmp-sync');

var fixtures = node_path.join(__dirname, 'fixtures');
var expected = node_path.join(fixtures, 'expected');

function expect_file (to, expected, name, expect_name) {
  var content = fs.read( node_path.join(to, name) );
  var expect_content = fs.read( node_path.join(expected, expect_name || name) );
   expect(content).to.equal(expect_content);
}

describe("scaffold-generator", function(){
  it(".copy(from, to, callback), override=false", function(done){
    var to = tmp.make(fixtures);
    var from = node_path.join(fixtures, 'template');
    fs.write( node_path.join(to, 'lib/index.js'), 'abc');

    scaffold({
      data: {
        name: 'cortex',
        main: 'lib/index.js'
      }

    }).copy(from, to, function (err) {
      expect_file(to, expected, 'package.json');

      // no change
      expect( fs.read(node_path.join(to, 'lib/index.js')) ).to.equal('abc');
      expect(err).to.equal(null);

      // .dot file
      expect( fs.exists(to, '.gitignore') ).to.equal(true);
      done();
    });
  });

  it(".copy(from, to, callback), override=true", function(done){
    var to = tmp.make(fixtures);
    var from = node_path.join(fixtures, 'template');
    fs.write( node_path.join(to, 'lib/index.js'), 'abc');

    scaffold({
      data: {
        name: 'cortex',
        main: 'lib/index.js'
      },
      override: true

    }).copy(from, to, function (err) {
      expect_file(to, expected, 'package.json');
      expect_file(to, expected, 'lib/index.js', 'index.js');
      expect(err).to.equal(null);
      done();
    });
  });

  it(".copy(map, mcallback), override=false", function(done){
    var to = tmp.make(fixtures);
    var from = node_path.join(fixtures, 'template');
    fs.write( node_path.join(to, 'lib/index.js'), 'abc');

    var map = {};
    map[ node_path.join(from, '<%=main%>') ] = node_path.join(to, 'lib/index.js');
    map[ node_path.join(from, 'package.json') ] = node_path.join(to, 'package.json');

    scaffold({
      data: {
        name: 'cortex',
        main: 'lib/index.js'
      }

    }).copy(map, function (err) {
      expect_file(to, expected, 'package.json');

      // no change
      expect( fs.read(node_path.join(to, 'lib/index.js')) ).to.equal('abc');
      expect(err).to.equal(null);
      done();
    });
  });

  it(".copy(map, mcallback), override=true", function(done){
    var to = tmp.make(fixtures);
    var from = node_path.join(fixtures, 'template');
    fs.write( node_path.join(to, 'lib/index.js'), 'abc');

    var map = {};
    map[ node_path.join(from, '<%=main%>') ] = node_path.join(to, 'lib/index.js');
    map[ node_path.join(from, 'package.json') ] = node_path.join(to, 'package.json');

    scaffold({
      data: {
        name: 'cortex',
        main: 'lib/index.js'
      },
      override: true

    }).copy(map, function (err) {
      expect_file(to, expected, 'package.json');
      expect_file(to, expected, 'lib/index.js', 'index.js');
      expect(err).to.equal(null);
      done();
    });
  });

  it(".copy(file, file, callback), override=false", function(done){
    var to = tmp.make(fixtures);
    var from = node_path.join(fixtures, 'template', 'package.json');
    var file_to = node_path.join(to, 'package.json');

    scaffold({
      data: {
        name: 'cortex',
        main: 'lib/index.js'
      }

    }).copy(from, file_to, function (err) {
      expect_file(to, expected, 'package.json');
      expect(err).to.equal(null);
      done();
    });
  });

  it(".copy(file, dir, callback), override=false", function(done){
    var to = tmp.make(fixtures);
    var from = node_path.join(fixtures, 'template', 'package.json');

    scaffold({
      data: {
        name: 'cortex',
        main: 'lib/index.js'
      }

    }).copy(from, to, function (err) {
      expect_file(to, expected, 'package.json');
      expect(err).to.equal(null);
      done();
    });
  });

  it(".write(to, template, callback)", function(done){
    var tmp_dir = tmp.make(fixtures);
    var base = '<%=name%>';
    var to = node_path.join(tmp_dir, base);

    scaffold({
      data: {
        name: 'abc.js',
        blah: 'blah'
      }
    }).write(to, '<%=blah%>', function () {
      var real_to = node_path.join(tmp_dir, 'abc.js');
      expect( fs.exists(real_to) ).to.equal(true);
      expect( fs.read(real_to) ).to.equal('blah');
      done();
    });
  });
});