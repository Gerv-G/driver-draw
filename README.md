# Driver Draw

Roulette for the year-end sim racing qualifiers. When a driver retires from their heat, spin to pick who gets the rest of their rig's session as free practice.

Live at https://gerv-g.github.io/driver-draw/

- Untick groups to leave them out of the draw, or tap a name to leave out one driver
- Names live in [groups.js](groups.js). First names only, since the page is public

## Run locally

It's a static page with ES modules, so it needs a server rather than opening the file directly:

```bash
python -m http.server 8417
```

## Test

```bash
npm test
```
