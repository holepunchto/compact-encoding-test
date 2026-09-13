const test = require('brittle')
const fs = require('fs')
const path = require('path')
const corpus = require('..')

test('the fixtures are installed', (t) => {
  const taxonomy = path.join(corpus.fixturesDir, 'index.json')

  t.ok(fs.existsSync(taxonomy), 'the corpus ships a taxonomy')
  if (!fs.existsSync(taxonomy)) return

  t.ok(corpus.allFixtures().length > 0, 'the corpus ships fixtures')
})

test('the specification ships alongside the fixtures', (t) => {
  t.ok(fs.existsSync(corpus.specPath), 'CODECS.md exists')
})

test('the capability taxonomy parses', (t) => {
  t.ok(Object.keys(corpus.capabilities()).length > 0, 'the taxonomy carries a category')
})
