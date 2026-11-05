// One group per rig: during qualifying each group takes turns on its own rig. Rig 6 is
// the motion rig, with motion turned off for qualifying and the final.
export const GROUP_IDS = ['1', '2', '3', '4', '5', '6'];

export const groupLabel = (id) => `Rig ${id}`;

// The final puts one driver on every rig
export const FINALISTS = GROUP_IDS.length;

export const MAX_ATTEMPTS = 5;
