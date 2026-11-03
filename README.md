# Driver Draw

Tools for the year-end sim racing qualifiers, published as a claude.ai artifact: https://claude.ai/artifact/PP8jF7TJBSixqeGX4pJbEp

- **Attendees**: who's coming. Groups and the draw only include people marked as coming. Walk-ins can be added here
- **Groups**: who's in which qualifier group. Tap a driver to move them (e.g. they're late, so they go in a later group) or lock them in their group. Shuffle deals everyone who's coming and isn't locked into balanced groups
- **Draw**: when a driver retires from their heat, spin to pick who gets the rest of their rig's session as free practice

The drivers live in the artifact's shared database (`drivers` collection, one document per driver), so every open copy updates live. The artifact is private: people need it shared with them on claude.ai, as Contributors to make changes. The page only works inside claude.ai. It used to run on GitHub Pages, which is now turned off.

## Publishing changes

The page and its scripts are published from this folder with Claude Code's Artifact tool, to the same URL. The data isn't part of the files, so republishing keeps it.

## Test

```bash
npm test
```
