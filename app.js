import { DRIVERS } from './groups.js';
import { normalise } from './roster.js';
import { createDrawView } from './draw-view.js';
import { createGroupsView } from './groups-view.js';

const STORAGE_KEY = 'driver-draw:roster';
const published = normalise(DRIVERS);
const publishedKey = JSON.stringify(published);

let roster = loadRoster();

function loadRoster() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    // Edits only make sense against the groups they were made on, so newly published groups win
    if (saved?.published === publishedKey) return saved.roster;
  } catch (error) {
    console.warn('Could not read the groups saved in this browser, so using the published ones', error);
  }
  return published;
}

function setRoster(next) {
  roster = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ published: publishedKey, roster }));
  } catch (error) {
    console.warn('Could not save the groups in this browser, so they reset on reload', error);
  }
  render();
}

const views = [
  createGroupsView({ getRoster: () => roster, setRoster, resetRoster: () => setRoster(published) }),
  createDrawView(() => roster),
];

function render() {
  for (const view of views) view.render();
}

const tabs = [...document.querySelectorAll('.tabs a')];

function showPanel() {
  const current = tabs.some((tab) => tab.hash === location.hash) ? location.hash : tabs[0].hash;
  for (const tab of tabs) {
    const selected = tab.hash === current;
    if (selected) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
    document.querySelector(`${tab.hash}-panel`).hidden = !selected;
  }
}

window.addEventListener('hashchange', showPanel);
showPanel();
render();
