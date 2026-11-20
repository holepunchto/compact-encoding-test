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
- [ ] **A report counts a port's unrun cases as matched** `[needs-info]` - `report()` filters `matched` by `!unsupported[fixture.id]`, but `unsupported` is keyed by codec name and `fixture.id` is a case id, so a port missing a codec reports every case it never ran as passing. (review of #213)
  - [ ] the shape needs a fourth disposition before the key can be fixed: `unrun` as a sibling list, dropping unrun cases entirely, or `unsupported` carrying its own case ids
  - [ ] stubbing `c.uint` away raises `summary.matched` from 220 to 222 while the human output falls to 200, so the two outputs contradict each other again
  - [ ] the human output never mentions `uncovered`
  - [ ] `test/document.js` asserts every case is matched or diverged, which pins this as correct - the fix changes the test, not just the code
  - [ ] `unsupported` maps every codec to one constant sentence; a sorted array says the same thing if nothing per-entry is added
- [ ] **Delete the no-op accounting in `report()`** `[ready-for-agent]` - `matched` already excludes diverged ids, so `covered` and both `.filter((id) => !covered.has(id))` calls do nothing; also hoist the inline `require('./package.json')`. (review of #213)
- [ ] **Move the conformance accounting test out of `test/document.js`** `[ready-for-agent]` - that file tests CODECS.md and CLAIMS.md prose, so the report test belongs in its own `test/conformance.js` wired into `test.js`. (review of #213)
- [ ] **`unsupported` names two different claims one call apart** `[ready-for-agent]` - `run()` uses it for the corpus-coverage reason that `report()` renames to `uncovered`, while `report()` uses it for codecs the implementation lacks; rename the one in `run()`. (review of #213)
- [ ] **The `diverged` example in CONFORMANCE.md shows no fields** `[ready-for-agent]` - it prints `{ "corpus": {}, "port": {} }`, so a port author learns nothing about what an answer holds. (review of #213)
