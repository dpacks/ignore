var fs = require('fs')
var path = require('path')
var test = require('tape')

var dPackIgnore = require('..')

test('default ignore with dir', function (t) {
  var ignore = dPackIgnore(__dirname)
  checkDefaults(t, ignore)

  // DPack Ignore stuff
  t.ok(ignore(path.join(__dirname, 'index.js')), 'full path index.js is ignored by .dpackignore')

  t.end()
})

test('custom ignore extends default (string)', function (t) {
  var ignore = dPackIgnore(__dirname, {ignore: '**/*.js'})
  t.ok(ignore('.dpack'), '.dpack folder ignored')
  t.ok(ignore('foo/bar.js'), 'custom ignore works')
  t.notOk(ignore('foo/bar.txt'), 'txt file gets to come along =)')
  t.end()
})

test('custom ignore extends default (array)', function (t) {
  var ignore = dPackIgnore(__dirname, {ignore: ['super_secret_stuff/*', '**/*.txt']})
  t.ok(ignore('.dpack'), '.dpack still feeling left out =(')
  t.ok(ignore('password.txt'), 'file ignored')
  t.ok(ignore('super_secret_stuff/file.js'), 'secret stuff stays secret')
  t.notOk(ignore('foo/bar.js'), 'js file joins the party =)')
  t.end()
})

test('ignore hidden option turned off', function (t) {
  var ignore = dPackIgnore(__dirname, {ignoreHidden: false})

  t.ok(ignore('.dpack'), '.dpack still feeling left out =(')
  t.notOk(ignore('.other-hidden'), 'hidden file NOT ignored')
  t.notOk(ignore('dir/.git'), 'hidden folders with dir NOT ignored')
  t.end()
})

test('useDPackIgnore false', function (t) {
  var ignore = dPackIgnore(__dirname, {useDPackIgnore: false})
  t.ok(ignore('.dpack'), '.dpack ignored')
  t.notOk(ignore(path.join(__dirname, 'index.js')), 'file in dpackignore not ignored')
  t.end()
})

test('change dpackignorePath', function (t) {
  var ignore = dPackIgnore(path.join(__dirname, '..'), {dpackignorePath: path.join(__dirname, '.dpackignore')})
  t.ok(ignore('.dpack'), '.dpack ignored')
  t.ok(ignore(path.join(__dirname, '..', 'index.js')), 'file in dpackignore ignored')
  t.end()
})

test('dpackignore as buf', function (t) {
  var ignore = dPackIgnore(__dirname, {dpackignore: fs.readFileSync(path.join(__dirname, '.dpackignore'))})
  t.ok(ignore('.dpack'), '.dpack ignored')
  t.ok(ignore(path.join(__dirname, 'index.js')), 'file in dpackignore ignored')
  t.end()
})

test('dpackignore as str', function (t) {
  var ignore = dPackIgnore(__dirname, {dpackignore: fs.readFileSync(path.join(__dirname, '.dpackignore'), 'utf-8')})
  t.ok(ignore('.dpack'), '.dpack ignored')
  t.ok(ignore(path.join(__dirname, 'index.js')), 'file in dpackignore ignored')
  t.end()
})

test('well-known not ignored', function (t) {
  var ignore = dPackIgnore(__dirname)
  t.notOk(ignore(path.join(__dirname, '.well-known/dweb')), 'well known dpack not ignored')
  t.end()
})

test('node_modules ignored', function (t) {
  var ignore = dPackIgnore(path.join(__dirname, '..'), {dpackignorePath: path.join(__dirname, '.dpackignore')})
  t.ok(ignore(path.join(__dirname, 'node_modules')), 'node_modules ignored')
  t.end()
})

test('node_modules subdir ignored', function (t) {
  var ignore = dPackIgnore(path.join(__dirname, '..'), {dpackignorePath: path.join(__dirname, '.dpackignore')})
  t.ok(ignore(path.join(__dirname, 'node_modules', 'dpack')), 'node_modules subdir ignored')
  t.end()
})

test('node_modules file ignored', function (t) {
  var ignore = dPackIgnore(path.join(__dirname, '..'), {dpackignorePath: path.join(__dirname, '.dpackignore')})
  t.ok(ignore(path.join(__dirname, 'node_modules', 'dpack', 'hello.txt')), 'node_modules subdir ignored')
  t.end()
})

test('throws without directory option', function (t) {
  t.throws(function () {
    dPackIgnore({opts: true})
  })
  t.end()
})

function checkDefaults (t, ignore) {
  // Default Ignore
  t.ok(
    ['.dpack', '/.dpack', '.dpack/', 'sub/.dpack'].filter(ignore).length === 4,
    'always ignore .dpack folder regardless of /')
  t.ok(
    ['.dpack/foo.bar', '/.dpack/foo.bar', '.dpack/dir/foo'].filter(ignore).length === 3,
    'files in .dpack folder ignored')
  t.ok(ignore('.DS_Store'), 'no thanks DS_Store')

  // Hidden Folder/Files Ignored
  t.ok(
    [
      '.git', '/.git', '.git/',
      '.git/sub', '.git/file.txt', 'dir/.git', 'dir/.git/test.txt'
    ].filter(ignore).length === 7, 'files in .dpack folder ignored')

  // DPack Ignore stuff
  t.ok(ignore('.dpackignore'), 'let .dpackignore through')

  // Things to Allow
  t.notOk(ignore('folder/asdf.dpacka/file.txt'), 'weird data folder is ok')
  t.notOk(
    ['file.dpack', 'file.dpack.jpg', 'the.dpack-thing'].filter(ignore).length !== 0,
    'does not ignore files/folders with .dpack in it')
}
