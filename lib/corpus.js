const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const FIXTURES = path.join(ROOT, 'fixtures')

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function codecs() {
  return Object.keys(readJSON(path.join(FIXTURES, 'index.json')).capabilities.integers)
}

function allFixtures() {
  const out = []
  for (const codec of codecs()) {
    out.push(...readJSON(path.join(FIXTURES, codec, 'cases.json')))
  }
  return out
}

function fixtureById(id) {
  return allFixtures().find((fixture) => fixture.id === id)
}

function mutants() {
  return readJSON(path.join(FIXTURES, 'mutants.json'))
}

function readCommitted() {
  const out = {}
  out[path.join('fixtures', 'index.json')] = fs.readFileSync(
    path.join(FIXTURES, 'index.json'),
    'utf8'
  )
  out[path.join('fixtures', 'mutants.json')] = fs.readFileSync(
    path.join(FIXTURES, 'mutants.json'),
    'utf8'
  )
  for (const codec of codecs()) {
    const file = path.join('fixtures', codec, 'cases.json')
    out[file] = fs.readFileSync(path.join(ROOT, file), 'utf8')
  }
  return out
}

module.exports = { allFixtures, fixtureById, mutants, readCommitted, codecs }
