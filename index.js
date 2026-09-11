const fs = require('fs')
const path = require('path')

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const fixturesDir = path.join(__dirname, 'fixtures')

const CAPABILITIES = readJSON(path.join(fixturesDir, 'index.json'))

module.exports = {
  capabilities: CAPABILITIES,
  fixturesDir,
  specPath: path.join(__dirname, 'CODECS.md')
}
