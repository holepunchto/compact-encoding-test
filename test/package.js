const test = require('brittle')
const fs = require('fs')
const path = require('path')
const { fixturesDir, specPath } = require('..')
const corpus = require('../lib/corpus')
const { allFixtures, capabilities } = corpus
const c = require('compact-encoding')
const { pinned } = require('../lib/spec')
const { devDependencies } = require('../package.json')

test('the fixtures are installed', (t) => {
  t.ok(fs.existsSync(path.join(fixturesDir, 'index.json')), 'the corpus ships a taxonomy')
  t.ok(allFixtures().length > 0, 'the corpus ships fixtures')
})

test('the specification ships alongside the fixtures', (t) => {
  t.ok(fs.existsSync(specPath), 'CODECS.md exists')
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

function accounted() {
  const names = new Set()

  for (const codecs of Object.values(capabilities())) {
    for (const name of Object.keys(codecs)) {
      names.add(name)

      const { codec } = corpus.loadCases(name)
      if (codec) names.add(codec.name + codec.of.join(''))
    }
  }

  return names
}

test('the taxonomy accounts for every codec the reference exports', (t) => {
  const names = accounted()
  const absent = Object.keys(c)
    .filter((name) => c[name] !== null && typeof c[name] === 'object')
    .filter((name) => typeof c[name].preencode === 'function')
    .filter((name) => !names.has(name))

  t.alike(absent, [], 'a codec the reference exports is covered or recorded with a reason')
})
