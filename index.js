const fs = require('fs')
const path = require('path')

const fixturesDir = path.join(__dirname, 'fixtures')
const specPath = path.join(__dirname, 'CODECS.md')

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function index() {
  return readJSON(path.join(fixturesDir, 'index.json'))
}

function capabilities() {
  return index().capabilities
}

function delegated() {
  return index().delegated
}

function codecs() {
  return Object.values(capabilities()).flatMap((category) => Object.keys(category))
}

function loadCodec(name) {
  return readJSON(path.join(fixturesDir, name, 'cases.json'))
}

function allFixtures() {
  return codecs().flatMap(loadCodec)
}

function fixtureById(id) {
  const fixtures = new Map(allFixtures().map((fixture) => [fixture.id, fixture]))
  return fixtures.get(id)
}

function mutants() {
  return readJSON(path.join(fixturesDir, 'mutants.json'))
}

module.exports = {
  allFixtures,
  capabilities,
  codecs,
  delegated,
  fixtureById,
  fixturesDir,
  loadCodec,
  mutants,
  specPath
}
