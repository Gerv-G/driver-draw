# Driver Draw

Tools for the year-end sim racing qualifiers, published as a claude.ai artifact: https://claude.ai/artifact/PP8jF7TJBSixqeGX4pJbEp

- **Attendees**: who's coming. Rigs and lap times only include people marked as coming. Walk-ins can be added here
- **Rigs**: which rig each driver queues for during qualifying, one group per rig. Tap a driver to move them or lock them on their rig. Shuffle deals everyone who's coming and isn't locked evenly across the rigs
- **Lap times**: save each attempt's lap time, up to 5 attempts per driver. Only a faster lap replaces a driver's best, and the leaderboard marks the top 6 who go to the final. The last save can be undone

The drivers live in the artifact's shared database (`drivers` collection, one document per driver), so every open copy updates live. The artifact is private: people need it shared with them on claude.ai, as Contributors to make changes. The page only works inside claude.ai.

The venue setup (rigs, attempts, finalists) is in [groups.js](groups.js).

## Publishing changes

The page and its scripts are published from this folder with Claude Code's Artifact tool, to the same URL. The data isn't part of the files, so republishing keeps it.

## Test

```bash
npm test
```
