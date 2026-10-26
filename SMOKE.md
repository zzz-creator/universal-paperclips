# Smoke checklist (manual tripwire)

Run after any change to game logic.

1. Open `index.html` in a browser. No console errors on load.
2. Make 10 paperclips manually. Clip count shows 10.
3. Buy 1 AutoClipper. Clips per second > 0.
4. Save (slot 1), reload page, load slot 1. Clip count and funds unchanged.
5. Corrupt a save (edit localStorage `saveGame` to invalid JSON), reload, load slot 1. Alert shown, no white screen, current state preserved.
6. Play through to space phase: probe count > 0, matter conversion displays.
7. Run one battle. Victory/defeat displays, honor updates, no console errors.
8. Prestige (universe reset). Page reloads, prestigeU increments.
9. Check large numbers format with suffixes (no raw 1e+54 in UI).
10. No debug menu visible without password.