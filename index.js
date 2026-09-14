const fs = require('fs')
const path = require('path')

const fixturesDir = path.join(__dirname, 'fixtures')
const specPath = path.join(__dirname, 'CODECS.md')

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function codecs() {
  return fs
    .readdirSync(fixturesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

function capabilities() {
  return readJSON(path.join(fixturesDir, 'index.json'))
}

function delegated() {
  return readJSON(path.join(fixturesDir, 'delegated.json'))
}

function mutants() {
  return readJSON(path.join(fixturesDir, 'mutants.json'))
}

function loadCases(name) {
  return readJSON(path.join(fixturesDir, name, 'cases.json'))
}

function loadAnswers(name) {
  return readJSON(path.join(fixturesDir, name, 'answers.json'))
}

function loadCodec(name) {
  const { cases } = loadCases(name)
  const answers = loadAnswers(name)
  return cases.map((example) => ({ ...example, answer: answers[example.id] }))
}

function allFixtures() {
  return codecs().flatMap(loadCodec)
}

function fixtureById(id) {
  return new Map(allFixtures().map((fixture) => [fixture.id, fixture])).get(id)
}

module.exports = {
  allFixtures,
  capabilities,
  codecs,
  delegated,
  fixtureById,
  fixturesDir,
  loadAnswers,
  loadCases,
  loadCodec,
  mutants,
  specPath
}
