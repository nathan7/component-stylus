'use strict';
var fs = require('fs')
  , literally = require('literally')
  , async = require('async')
  , Stylus = require('stylus')
  , Nib = function() {}
try { Nib = require('nib') } catch (e) {}

module.exports = function(builder) { builder.hook('before styles', Build.bind(builder)) }

function Build(pkg, next) {
  var builder = this
  async.each((pkg.config.styles || []).filter(isStylus), function(filename, cb) {
    async.waterfall(
      [ literally.async(filename)
      , readFile
      , compileFile
      , addFile
      ]
    , cb)

    function compileFile(stylus, cb) {
      Stylus(stylus)
        .set('filename', filename)
        .set('compress', !builder.dev)
        .use(Nib)
        .render(cb)
    }

    function addFile(css, cb) {
      pkg._files[filename] = css
      cb()
    }
  }, next)
}

function readFile(fname, cb) { fs.readFile(fname, 'utf8', cb) }
function isStylus(fname) { return !!fname.match(/\.styl$/) }
