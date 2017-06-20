const test = require('ava')
const Scaffold = require('../index')
const fs = require('fs-extra')
const mustache = require('mustache')
const path = require('path')
const _tmp = require('tmp')

mustache.escape = v => v

const template = (filepath = '') =>
  path.join(__dirname, 'fixtures', 'template', filepath)

const expected = (filepath = '') =>
  path.join(__dirname, 'fixtures', 'expected', filepath)


// @param {path} dest dest dir
async function equal (t, dest, name, dest_name, equal = true) {
  const content = await fs.readFile(path.join(dest, dest_name || name))
  const expect_content = await fs.readFile(expected(name))

  if (equal) {
    t.is(content.toString(), expect_content.toString(),
      `content not the same: ${dest}/${name}`)
    return
  }

  if (content.toString() === expect_content.toString()) {
    t.fail(`should not equal: ${dest}/${name}`)
  }
}


function notEqual (t, d, n) {
  return equal(t, d, n, undefined, false)
}


async function expect (t, dest, name, expect_content) {
  const content = await fs.readFile(path.join(dest, name))
  t.is(content.toString(), expect_content, 'wrong content: ${dest}')
}


function s (o) {
  o.render = mustache.render
  return new Scaffold(o)
}


function tmp () {
  return new Promise((resolve, reject) => {
    _tmp.dir((err, path) => {
      if (err) {
        return reject(err)
      }

      resolve(path)
    })
  })
}


const data = {
  name: 'foo',
  main: 'index.js'
}

test('copy, override=false, not exists', async t => {
  const to = await tmp()
  await s({
    data
  })
  .copy(template(), to)

  await equal(t, to, 'index.js')
  await equal(t, to, 'package.json')
})

test('copy, override=false, not exists, hierachical dirs', async t => {
  const to = await tmp()
  await s({
    data: {
      name: 'foo',
      main: 'lib/index.js'
    }
  })
  .copy(template(), to)

  await equal(t, to, 'index.js', 'lib/index.js')
})


test('copy, override=false, exists', async t => {
  const to = await tmp()
  await fs.writeFile(path.join(to, 'index.js'), 'a')

  await s({
    data,
    override: false
  })
  .copy(template(), to)

  await notEqual(t, to, 'index.js')
  await expect(t, to, 'index.js', 'a')
  await equal(t, to, 'package.json')
})


test('copy, override=true, backup=true, exists', async t => {
  const to = await tmp()
  await fs.writeFile(path.join(to, 'index.js'), 'a')

  await s({
    data,
    override: true
  })
  .copy(template(), to)

  await equal(t, to, 'index.js')
  await expect(t, to, 'index.js.bak', 'a')
  await equal(t, to, 'package.json')
})


test('copy, override=true, backup=false, exists', async t => {
  const to = await tmp()
  await fs.writeFile(path.join(to, 'index.js'), 'a')

  await s({
    data,
    override: true,
    backup: false
  })
  .copy(template(), to)

  await equal(t, to, 'index.js')
  await equal(t, to, 'package.json')

  const dest = path.join(to, 'index.js.bak')
  const exists = await fs.exists(dest)
  t.is(exists, false, 'should not backup')
})
