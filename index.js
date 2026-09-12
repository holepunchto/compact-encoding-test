const fs = require('fs')
const path = require('path')

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const fixturesDir = path.join(__dirname, 'fixtures')

const INDEX = readJSON(path.join(fixturesDir, 'index.json'))

function loadCodec(name) {
  return readJSON(path.join(fixturesDir, name, 'cases.json'))
}

module.exports = {
  capabilities: INDEX.capabilities,
  delegated: INDEX.delegated,
  fixturesDir,
  loadCodec,
  specPath: path.join(__dirname, 'CODECS.md')
}
