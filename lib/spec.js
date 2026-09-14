const fs = require('fs')
const path = require('path')

const specPath = path.join(__dirname, '..', 'CODECS.md')

const RULE = /^- `([a-z0-9][a-z0-9-]*)`( \(delegated\))? - /
const RULE_SHAPED = /^- `/

function lines() {
  return fs.readFileSync(specPath, 'utf8').split('\n')
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

function ruleSlugs() {
  return new Set(rules().map((rule) => rule.slug))
}

module.exports = { rules, ruleSlugs, malformed, specPath }
