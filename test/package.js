const test = require('brittle')
const fs = require('fs')
const corpus = require('..')

test('the package locates its own fixtures directory', (t) => {
  t.ok(fs.existsSync(corpus.fixturesDir), 'fixtures directory exists')
})

test('the specification ships alongside the fixtures', (t) => {
  t.ok(fs.existsSync(corpus.specPath), 'CODECS.md exists')
})

test('the capability taxonomy parses', (t) => {
  t.ok(corpus.capabilities && typeof corpus.capabilities === 'object', 'capabilities is an object')
})
