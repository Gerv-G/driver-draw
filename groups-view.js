import { GROUP_IDS } from './groups.js';
import { membersOf, shuffleIntoGroups, updateDriver } from './roster.js';

export function createGroupsView({ getRoster, setRoster, resetRoster }) {
  const board = document.querySelector('#roster');
  const dialog = document.querySelector('#driver-dialog');
  const dialogTitle = document.querySelector('#driver-name');
  const groupPicker = document.querySelector('#group-picker');
  const lockedInput = document.querySelector('#locked');
  const attendingInput = document.querySelector('#attending');
  let editing = null;

  groupPicker.append(...GROUP_IDS.map((id) => {
    const label = document.createElement('label');
    label.className = 'pick';
    label.style.setProperty('--group-color', `var(--group-${id.toLowerCase()})`);
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'group';
    radio.value = id;
    const text = document.createElement('span');
    text.textContent = id;
    label.append(radio, text);
    return label;
  }));

  function edit(changes) {
    setRoster(updateDriver(getRoster(), editing, changes));
    fillDialog();
  }

  groupPicker.addEventListener('change', (event) => edit({ group: event.target.value }));
  lockedInput.addEventListener('change', () => edit({ locked: lockedInput.checked }));
  attendingInput.addEventListener('change', () => edit({ attending: attendingInput.checked }));

  document.querySelector('#shuffle').addEventListener('click', () => {
    if (!window.confirm("Reshuffle everyone who's coming and isn't locked?")) return;
    setRoster(shuffleIntoGroups(getRoster(), GROUP_IDS));
  });

  document.querySelector('#reset').addEventListener('click', () => {
    if (!window.confirm('Undo every change made on this device and go back to the published groups?')) return;
    resetRoster();
  });

  function fillDialog() {
    const driver = getRoster().find(({ name }) => name === editing);
    dialogTitle.textContent = driver.name;
    for (const radio of groupPicker.querySelectorAll('input')) radio.checked = radio.value === driver.group;
    lockedInput.checked = driver.locked;
    lockedInput.disabled = driver.group === null;
    attendingInput.checked = driver.attending;
  }

  function openDialog(name) {
    editing = name;
    fillDialog();
    dialog.showModal();
  }

  function chip(driver) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = driver.attending ? 'chip' : 'chip muted';
    button.textContent = driver.locked ? `${driver.name} 🔒` : driver.name;
    button.setAttribute('aria-haspopup', 'dialog');
    if (driver.locked) button.setAttribute('aria-label', `${driver.name}, locked`);
    button.addEventListener('click', () => openDialog(driver.name));
    return button;
  }

  function card(title, drivers, color) {
    const section = document.createElement('section');
    section.className = 'group';
    section.style.setProperty('--group-color', color);
    const heading = document.createElement('h3');
    heading.textContent = `${title} · ${drivers.length}`;
    const chips = document.createElement('div');
    chips.className = 'chips';
    chips.append(...drivers.map(chip));
    section.append(heading, chips);
    return section;
  }

  function render() {
    const roster = getRoster();
    const cards = GROUP_IDS.map((id) => card(`Group ${id}`, membersOf(roster, id), `var(--group-${id.toLowerCase()})`));
    const noGroup = roster.filter((driver) => driver.attending && driver.group === null);
    const notComing = roster.filter((driver) => !driver.attending);
    if (noGroup.length > 0) cards.push(card('No group yet', noGroup, 'var(--muted)'));
    if (notComing.length > 0) cards.push(card('Not coming', notComing, 'var(--border)'));
    board.replaceChildren(...cards);
  }

  return { render };
}
