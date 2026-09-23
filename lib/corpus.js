const fs = require('fs')
const path = require('path')
const { fixturesDir } = require('..')

const TOKENS = new Map([
  ['NaN', NaN],
  ['Infinity', Infinity],
  ['-Infinity', -Infinity],
  ['-0', -0]
])

function value(token) {
  return TOKENS.has(token) ? TOKENS.get(token) : token
}

function token(number) {
  if (Number.isNaN(number)) return 'NaN'
  if (number === Infinity) return 'Infinity'
  if (number === -Infinity) return '-Infinity'
  if (Object.is(number, -0)) return '-0'
  return number
}

function tokenised(input) {
  return typeof input === 'string' && TOKENS.has(input)
}

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

function kind(answer) {
  if (answer.hex !== undefined) return 'hex'
  if (answer.refused !== undefined) return 'refused'
  if (answer.decodes !== undefined) return 'decodes'
  return 'rejects'
}

function states(answer) {
  const shape = kind(answer)
  return shape === 'hex' || shape === 'refused' ? 'bytes' : 'meaning'
}

module.exports = {
  allFixtures,
  asks,
  token,
  tokenised,
  value,
  capabilities,
  codecs,
  delegated,
  fixtures,
  fixturesDir,
  kind,
  loadCases,
  mutants,
  states
}
