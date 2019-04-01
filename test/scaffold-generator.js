const test = require('ava')
const Scaffold = require('..')
const fs = require('fs-extra')
const mustache = require('mustache')
const path = require('path')
const _tmp = require('tmp')

mustache.escape = v => v

const template = (...args) =>
  path.join(__dirname, 'fixtures', 'template', ...args)

const expected = (...args) =>
  path.join(__dirname, 'fixtures', 'expected', ...args)


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
    data,
    ignore: ['DS_Store']
  })
  .copy(template(), to)

  await equal(t, to, 'index.js')
  await equal(t, to, 'package.json')
  await equal(t, to, 'dir/file.js')

  const exists = await fs.exists(path.join(to, 'DS_Store'))
  t.false(exists)
})

test('copy file to dir', async t => {
  const to = await tmp()
  await s({
    data
  })
  .copy(template('{{main}}'), to)

  await equal(t, to, 'index.js')
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

test('copy files map', async t => {
  const map = {}
  const to = await tmp()
  map[template('{{main}}')] = to
  map[template('package.json')] = to

  await s({
    data: {
      name: 'foo',
      main: 'index.js'
    }
  })
  .copy(map)

  await equal(t, to, 'index.js')
  await equal(t, to, 'package.json')
})

test('copy dir, override=false, exists', async t => {
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

test('write, normal', async t => {
  const to = await tmp()

  await s({
    data
  })
  .write(path.join(to, 'write.js'), '// {{name}}\n')

  await equal(t, to, 'write.js')
})

test('write, override=true, backup=true', async t => {
  const to = await tmp()
  await fs.writeFile(path.join(to, 'write.js'), 'a')

  await s({
    data
  })
  .write(path.join(to, 'write.js'), '// {{name}}\n')

  await equal(t, to, 'write.js')
})

test('write, override=false', async t => {
  const to = await tmp()
  const filepath = path.join(to, 'write.js')
  await fs.writeFile(filepath, 'a')

  await s({
    data,
    override: false
  })
  .write(filepath, '// {{name}}\n')

  const content = await fs.readFile(filepath)
  t.is(content.toString(), 'a')
})
