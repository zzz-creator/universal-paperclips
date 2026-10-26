# Save serialization audit

Sites (all in main.js):
- Writers: save() ~4701, save1() ~4989, save2() ~5278 (each ~288-290 lines)
- Readers: load() ~5567, load1() ~5874, load2() ~6178, loadPrestige() ~6540
- Keys: saveGame/saveProjectsUses/saveProjectsFlags/saveProjectsActive/saveStratsActive (+ slot suffix 1/2); savePrestige (prestige only).

Findings:
- The three save* bodies are near-identical (~288 lines) differing only in slot suffix for localStorage keys. Same for load bodies.
- loadPrestige is separate (prestigeU/prestigeS only).
- Each save builds one `saveGame` object literal with ~100+ fields, then writes 5 keys. No shared serializer.
- Risk: any new field must be added in 3 writers + 3 readers (+ prestige) or saves silently drop it. No tests.

Mitigation applied this pass:
- Added `schemaVersion: 1` to saveGame (3 sites).
- Migration shim in load/load1/load2: if schemaVersion missing, treat as v1.
- try/catch guards around JSON.parse (prior pass).
- Offline catch-up capped at 60s ticks, gated on lastTick.

Consolidation (full 6->1 function merge) deferred: ~900 lines of duplicated restore logic; recommend a dedicated refactor session with a round-trip smoke test first.