const test = require('brittle')
const fs = require('fs')
const path = require('path')
const { fixturesDir } = require('..')
const corpus = require('../lib/corpus')
const { allFixtures, capabilities } = corpus
const { pinned } = require('../lib/spec')
const { devDependencies } = require('../package.json')

test('the fixtures are installed', (t) => {
  t.ok(fs.existsSync(path.join(fixturesDir, 'index.json')), 'the corpus ships a taxonomy')
  t.ok(allFixtures().length > 0, 'the corpus ships fixtures')
})

test('the specification pins the reference the fixtures were generated from', (t) => {
  t.is(
    pinned(),
    devDependencies['compact-encoding'],
    'CODECS.md names the version the corpus builds against'
  )
})

function listed() {
  return Object.values(capabilities()).flatMap((codecs) => Object.entries(codecs))
}

test('the taxonomy names a codec under a category', (t) => {
  t.ok(listed().length > 0, 'the taxonomy carries a codec')
})

test('every case the taxonomy names is a case the corpus carries', (t) => {
  const ids = new Set(allFixtures().map((fixture) => fixture.id))
  const dangling = listed()
    .flatMap(([codec, cases]) => cases.map((id) => `${codec}: ${id}`))
    .filter((named) => !ids.has(named.split(': ')[1]))

  t.alike(dangling, [], 'a case id in the taxonomy names a case')
})
