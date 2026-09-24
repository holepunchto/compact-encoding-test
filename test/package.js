const test = require('brittle')
const fs = require('fs')
const path = require('path')
const corpus = require('..')
const { allFixtures, capabilities } = require('../lib/corpus')
const { pinned } = require('../lib/spec')
const { devDependencies } = require('../package.json')

test('the fixtures are installed', (t) => {
  t.ok(fs.existsSync(path.join(corpus.fixturesDir, 'index.json')), 'the corpus ships a taxonomy')
  t.ok(allFixtures().length > 0, 'the corpus ships fixtures')
})

test('the specification ships alongside the fixtures', (t) => {
  t.ok(fs.existsSync(corpus.specPath), 'CODECS.md exists')
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
  const categories = Object.keys(taxonomy)

  t.ok(categories.length > 0, 'the taxonomy carries a category')
  t.ok(Object.keys(taxonomy[categories[0]]).length > 0, 'a category carries a codec')
})
