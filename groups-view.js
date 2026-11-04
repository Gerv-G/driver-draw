import { GROUP_IDS, RIGS_PER_HEAT } from './groups.js';
import { membersOf, shuffleIntoGroups, updateDriver } from './roster.js';

export function createGroupsView({ getRoster, setRoster, canWrite }) {
  const board = document.querySelector('#roster');
  const dialog = document.querySelector('#driver-dialog');
  const dialogTitle = document.querySelector('#driver-name');
  const groupPicker = document.querySelector('#group-picker');
  const lockedInput = document.querySelector('#locked');
  const shuffleButton = document.querySelector('#shuffle');
  const confirmBar = document.querySelector('#shuffle-confirm');
  const notComing = document.querySelector('#not-coming');
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
  }

  groupPicker.addEventListener('change', (event) => edit({ group: event.target.value }));
  lockedInput.addEventListener('change', () => edit({ locked: lockedInput.checked }));

  // The viewer blocks window.confirm, so the page asks for itself
  shuffleButton.addEventListener('click', () => { confirmBar.hidden = false; });
  document.querySelector('#shuffle-cancel').addEventListener('click', () => { confirmBar.hidden = true; });
  document.querySelector('#shuffle-go').addEventListener('click', () => {
    confirmBar.hidden = true;
    setRoster(shuffleIntoGroups(getRoster(), GROUP_IDS, RIGS_PER_HEAT));
  });

  function fillDialog() {
    const driver = getRoster().find(({ name }) => name === editing);
    if (!driver) {
      dialog.close();
      return;
    }
    dialogTitle.textContent = driver.name;
    for (const radio of groupPicker.querySelectorAll('input')) {
      radio.checked = radio.value === driver.group;
      radio.disabled = !canWrite();
    }
    lockedInput.checked = driver.locked;
    lockedInput.disabled = !canWrite() || driver.group === null;
  }

  function openDialog(name) {
    editing = name;
    fillDialog();
    dialog.showModal();
  }

  function chip(driver) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
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
    if (noGroup.length > 0) cards.push(card('No group yet', noGroup, 'var(--muted)'));
    board.replaceChildren(...cards);

    const away = roster.filter((driver) => !driver.attending).length;
    notComing.textContent = away === 0 ? '' : `${away} not coming, so not shown. Change that on the Attendees page.`;
    shuffleButton.disabled = !canWrite();
    if (dialog.open) fillDialog();
  }

  return { render };
}
