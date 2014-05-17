'use strict';

var expect = require('chai').expect;
var scaffold = require('../');
var fs = require('fs-sync');
var node_path = require('path');
var tmp = require('tmp-sync');

var fixtures = node_path.join(__dirname, 'fixtures');
var expected = node_path.join(fixtures, 'expected');

function expect_file (to, expected, name, expect_name) {
  var content = fs.read( node_path.join(expected, name) );
  var expect_content = fs.read( node_path.join(expected, expect_name || name) );
   expect(content).to.equal(expect_content);
}

describe("scaffold-generator", function(){
  it(".generate(from, to, callback)", function(done){
    var to = tmp.make(fixtures);
    var from = node_path.join(fixtures, 'template');
    

    scaffold({
      data: {
        name: 'cortex',
        main: ''
      }

    }).generate(from, to, function (err) {
      expect_file(to, expected, 'index.js');
      expect_file(to, expected, 'package.json');
      expect(err).to.equal(null);
      done();
    });
  });
});