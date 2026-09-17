const fs = require('fs')
const path = require('path')
const { fixturesDir } = require('..')

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

function fixtures(name) {
  const { cases } = loadCases(name)
  const answers = loadAnswers(name)
  return cases.map((example) => ({ ...example, answer: answers[example.id] }))
}

function allFixtures() {
  return codecs().flatMap(fixtures)
}

function asks(example) {
  return example.input.value !== undefined ? 'bytes' : 'meaning'
}

function states(answer) {
  return answer.hex !== undefined || answer.refused !== undefined ? 'bytes' : 'meaning'
}

module.exports = {
  allFixtures,
  asks,
  capabilities,
  codecs,
  delegated,
  fixtures,
  fixturesDir,
  loadCases,
  mutants,
  states
}
