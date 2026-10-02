const fs = require('fs')
const { specPath } = require('..')

const RULE = /^- `([a-z0-9][a-z0-9-]*)`(?: \((delegated|unrepresentable)\))? - /
const PIN = /^Reference implementation: `compact-encoding` (\S+)\.$/
const RULE_SHAPED = /^- `/

function lines() {
  return fs.readFileSync(specPath, 'utf8').split('\n')
}

function rules() {
  const out = []

  for (const line of lines()) {
    const match = RULE.exec(line)
    if (match) {
      out.push({
        slug: match[1],
        delegated: match[2] === 'delegated',
        unrepresentable: match[2] === 'unrepresentable'
      })
    }
  }

  return out
}

function malformed() {
  return lines().filter((line) => RULE_SHAPED.test(line) && !RULE.test(line))
}

function pinned() {
  for (const line of lines()) {
    const match = PIN.exec(line)
    if (match) return match[1]
  }

  return null
}

function ruleSlugs() {
  return new Set(rules().map((rule) => rule.slug))
}

module.exports = { malformed, pinned, rules, ruleSlugs }
