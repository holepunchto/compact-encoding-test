# TODO

Agent task tracking for this repo. One entry per line:

```markdown
- [ ] **Title** `[role]` - one sentence saying what the work is. (origin)
```

`[role]` is one of `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Sub-items and findings go in indented bullets beneath an entry. The PR that finishes an entry deletes it; git history is the record of what shipped.

GitHub Issues are the surface for external contributors. Human-facing work lives in Asana.

- [ ] **Corpus for compact-encoding: CODECS.md, fixtures, and a rule-coverage gate** `[ready-for-agent]` - the umbrella: a specification a port can be built from, fixtures generated from the pinned reference, and a build that fails when a rule has no fixture. (was #1)
  - [ ] the 1.0.0 gate is met: every family has a passing run recorded under `test/agents/`
- [ ] **Run the corpus against every implementation** `[ready-for-human]` - each port runs the corpus fixtures in a harness in its own language and declares the capabilities it does not support. (was #19)
- [ ] **Move the conformance accounting test out of `test/document.js`** `[ready-for-agent]` - that file tests CODECS.md and CLAIMS.md prose, so the report test belongs in its own `test/conformance.js` wired into `test.js`. (review of #213)
- [ ] **The `diverged` example in CONFORMANCE.md shows no fields** `[ready-for-agent]` - it prints `{ "corpus": {}, "port": {} }`, so a port author learns nothing about what an answer holds. (review of #213)
