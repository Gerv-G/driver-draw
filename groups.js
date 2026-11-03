export const GROUP_IDS = ['A', 'B', 'C', 'D'];

// The published groups. Edits made in the app are saved in that browser only, and are
// dropped whenever this list changes. First names only: this page is public.
export const DRIVERS = [
  { name: 'Gab', group: 'A' },
  { name: 'Mic', group: 'A' },
  { name: 'Rob', group: 'A' },
  { name: 'Marlon', group: 'A' },
  { name: 'Rommel', group: 'A' },
  { name: 'Kier', group: 'A' },
  { name: 'Rissa', group: 'B' },
  { name: 'Chezka', group: 'B' },
  { name: 'Gellyn', group: 'B' },
  { name: 'Eden', group: 'B' },
  { name: 'Jon', group: 'B' },
  { name: 'Mandy', group: 'C' },
  { name: 'Jacky', group: 'C' },
  { name: 'Shiela', group: 'C' },
  // Organisers go in later heats, in different groups, so they're free to run things
  { name: 'Nick', group: 'C', locked: true },
  { name: 'Jifferson', group: 'C' },
  { name: 'Jave', group: 'D' },
  { name: 'John', group: 'D' },
  { name: 'Gervin', group: 'D', locked: true },
  { name: 'Mikko', group: 'D' },
  { name: 'Alvin', group: 'D' },
  // Declined the invite (out of office), kept in case he turns up
  { name: 'Sean', attending: false },
];
