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

test('the taxonomy names a category, a codec and its cases', (t) => {
  const taxonomy = capabilities()
  const listed = Object.entries(taxonomy).flatMap(([category, codecs]) =>
    Object.entries(codecs).map(([codec, cases]) => ({ category, codec, cases }))
  )
  const ids = new Set(allFixtures().map((fixture) => fixture.id))

  t.ok(listed.length > 0, 'the taxonomy carries a codec under a category')

  const dangling = listed
    .flatMap(({ codec, cases }) => cases.map((id) => ({ codec, id })))
    .filter(({ id }) => !ids.has(id))
    .map(({ codec, id }) => `${codec}: ${id}`)

  t.alike(dangling, [], 'a case the taxonomy names is a case the corpus carries')
})
