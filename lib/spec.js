const fs = require('fs')
const path = require('path')

const SPEC = path.join(__dirname, '..', 'CODECS.md')

const RULE = /^- `([a-z0-9][a-z0-9-]*)`( \(delegated\))? - /
const RULE_SHAPED = /^- `/

function lines() {
  return fs.readFileSync(SPEC, 'utf8').split('\n')
}

function rules() {
  const out = []

  for (const line of lines()) {
    const match = RULE.exec(line)
    if (match) out.push({ slug: match[1], delegated: match[2] !== undefined })
  }

  return out
}

function malformed() {
  return lines().filter((line) => RULE_SHAPED.test(line) && !RULE.test(line))
}

module.exports = { rules, malformed }
