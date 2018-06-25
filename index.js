var assert = require('assert')
var fs = require('fs')
var path = require('path')
var match = require('anymatch')
var xtend = require('xtend')

module.exports = ignore

function ignore (dir, opts) {
  assert.equal(typeof dir, 'string', 'dpack-ignore: directory required')
  opts = xtend({
    dpackignorePath: path.join(dir, '.dpackignore')
  }, opts)
  dir = path.resolve(dir)

  var allow = ['!**/.well-known/dpack', '!.well-known/dpack']
  var ignoreMatches = opts.ignore // we end up with array of ignores here
    ? Array.isArray(opts.ignore)
      ? opts.ignore
      : [opts.ignore]
    : []

  var defaultIgnore = [/^(?:\/.*)?\.dpack(?:\/.*)?$/, '.DS_Store', '**/.DS_Store'] // ignore .dpack (and DS_Store)
  var ignoreHidden = !(opts.ignoreHidden === false) ? [/(^\.|\/\.).*/] : null // ignore hidden files anywhere
  var dPackIgnore = !(opts.useDPackIgnore === false) ? readDPackIgnore() : null

  // Add ignore options
  ignoreMatches = ignoreMatches.concat(defaultIgnore) // always ignore .dpack folder
  if (dPackIgnore) ignoreMatches = ignoreMatches.concat(dPackIgnore) // add .dpackignore
  if (ignoreHidden) ignoreMatches = ignoreMatches.concat(ignoreHidden) // ignore all hidden things
  ignoreMatches = ignoreMatches.concat(allow)

  // https://github.com/Kikobeats/micro-dev/blob/76ce110f0a126452256bc642cb1db4b7b2f14bf2/lib/listening.js#L30-L34
  var ignored = ignoreMatches.reduce(function (acc, ignore) {
    if (typeof ignore !== 'string') {
      // globs
      acc.push(ignore)
      return acc
    }
    var file = path.resolve(dir, ignore)
    if (isDirSync(file)) {
      acc.push(`**/${path.basename(file)}`)
      acc.push(`**/${path.basename(file)}/**`)
    } else {
      acc.push(ignore)
    }
    return acc
  }, [])

  return function (file) {
    file = file.replace(dir, '') // remove dir so we do not ignore anything in that path
    file = file.replace(/^\//, '')
    return match(ignored, file)
  }

  function isDirSync (path) {
    return fs.existsSync(path) && fs.statSync(path).isDirectory()
  }

  function readDPackIgnore () {
    try {
      var ignores = opts.dpackignore || fs.readFileSync(opts.dpackignorePath, 'utf8')
      if (ignores && typeof opts.dpackignore !== 'string') ignores = ignores.toString()
      return ignores
        .trim()
        .split(/[\r\n]+/g)
        .filter(function (str) {
          return !!str.trim()
        })
    } catch (e) {
      return []
    }
  }
}
