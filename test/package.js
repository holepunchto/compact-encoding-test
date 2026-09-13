const test = require('brittle')
const fs = require('fs')
const path = require('path')
const corpus = require('..')

test('the fixtures are installed', (t) => {
  t.ok(fs.existsSync(path.join(corpus.fixturesDir, 'index.json')), 'the corpus ships a taxonomy')
  t.ok(corpus.allFixtures().length > 0, 'the corpus ships fixtures')
})

test('the specification ships alongside the fixtures', (t) => {
  t.ok(fs.existsSync(corpus.specPath), 'CODECS.md exists')
})

test('the capability taxonomy parses', (t) => {
  t.ok(Object.keys(corpus.capabilities()).length > 0, 'the taxonomy carries a category')
})
