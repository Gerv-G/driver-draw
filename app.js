import { changesBetween, normalise } from './roster.js';
import { createAttendeesView } from './attendees-view.js';
import { createDrawView } from './draw-view.js';
import { createGroupsView } from './groups-view.js';

const LOADING_TIMEOUT_MS = 10000;

const status = document.querySelector('#status');
let roster = [];
let drivers = null;
// null means the platform hasn't said, so controls stay on until a save is refused
let writeAllowed = null;

const canWrite = () => drivers !== null && writeAllowed !== false;

function showStatus(message) {
  status.textContent = message;
  status.hidden = message === '';
}

function handleSaveError(error, what) {
  if (error?.code === 'invalid_argument' && writeAllowed === null) {
    writeAllowed = false;
    showStatus("You can view the groups but not change them. Ask the organisers for edit access.");
    render();
    return;
  }
  showStatus(`Couldn't save ${what}. Check the connection and try again.`);
  console.error(`Saving ${what} failed`, error);
}

function setRoster(next) {
  if (!canWrite()) return;
  for (const { name, fields } of changesBetween(roster, next)) {
    const driver = roster.find((d) => d.name === name);
    drivers.doc(driver.id).update(fields).catch((error) => handleSaveError(error, `${name}'s change`));
  }
}

async function addDriver(name) {
  if (!canWrite()) return;
  try {
    await drivers.add({ name, attending: true, group: null, locked: false });
  } catch (error) {
    handleSaveError(error, name);
  }
}

const views = [
  createAttendeesView({ getRoster: () => roster, setRoster, addDriver, canWrite }),
  createGroupsView({ getRoster: () => roster, setRoster, canWrite }),
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

async function connect() {
  const db = await window.claude?.use('db');
  if (!db) {
    showStatus('Open this page on claude.ai, signed in, to see the groups.');
    render();
    return;
  }

  const user = await window.claude.use('user');
  writeAllowed = user ? await user.can('data.write') : null;
  if (writeAllowed === false) showStatus("You can view the groups but not change them. Ask the organisers for edit access.");
  drivers = db.collection('drivers');

  const loading = setTimeout(() => showStatus("Can't reach the shared groups yet. Check the connection."), LOADING_TIMEOUT_MS);
  drivers.onSnapshot((snapshot) => {
    if (!snapshot.metadata.fromCache) {
      clearTimeout(loading);
      if (status.textContent.startsWith("Can't reach")) showStatus('');
    }
    roster = normalise(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    render();
  }, (error) => {
    clearTimeout(loading);
    drivers = null;
    showStatus('Lost the connection to the shared groups. Reload the page to reconnect.');
    console.error('Driver list subscription ended', error);
    render();
  });
}

window.addEventListener('hashchange', showPanel);
showPanel();
render();
connect();
