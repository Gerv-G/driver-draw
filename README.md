# Driver Draw

Tools for the year-end sim racing qualifiers, live at https://gerv-g.github.io/driver-draw/

- **Groups**: who's in which qualifier group. Tap a driver to move them (e.g. they're late, so they go in a later group), lock them in their group, or mark them as not coming. Shuffle deals everyone who's coming and isn't locked into balanced groups
- **Draw**: when a driver retires from their heat, spin to pick who gets the rest of their rig's session as free practice

Changes made in the app are saved in that browser only. The published groups live in [groups.js](groups.js), with first names only since the page is public. Publishing new groups there throws away the edits saved in each browser.

## Run locally

It's a static page with ES modules, so it needs a server rather than opening the file directly:

```bash
python -m http.server 8417
```

## Test

```bash
npm test
```
