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

Consolidation (this pass):
- save() now accepts `slot` param; save1()/save2() delegate to save("1")/save("2").
- load() now accepts `slot` param; load1()/load2() delegate to load("1")/load("2").
- All localStorage keys parameterized by slot.
- Single copy of the saveGame object literal and the restore body remains.
- Round-trip smoke test: see SMOKE.md (save → reload → diff values).