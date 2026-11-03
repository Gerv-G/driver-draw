import { isNameTaken, updateDriver } from './roster.js';

export function createAttendeesView({ getRoster, setRoster, addDriver, canWrite }) {
  const list = document.querySelector('#attendee-list');
  const summary = document.querySelector('#attendee-summary');
  const form = document.querySelector('#add-driver');
  const input = document.querySelector('#new-driver');
  const addButton = document.querySelector('#add-driver-button');
  const formError = document.querySelector('#add-driver-error');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = input.value.trim();
    if (name === '') {
      formError.textContent = 'Type a first name to add.';
      return;
    }
    if (isNameTaken(getRoster(), name)) {
      formError.textContent = `${name} is already on the list. Add a surname initial to tell them apart.`;
      return;
    }
    formError.textContent = '';
    addButton.disabled = true;
    try {
      await addDriver(name);
      input.value = '';
    } finally {
      addButton.disabled = !canWrite();
    }
  });

  function row(driver) {
    const item = document.createElement('li');
    const label = document.createElement('label');
    label.className = driver.attending ? 'attendee' : 'attendee out';
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.className = 'switch';
    toggle.id = `coming-${driver.id ?? driver.name}`;
    toggle.checked = driver.attending;
    toggle.disabled = !canWrite();
    toggle.addEventListener('change', () => setRoster(updateDriver(getRoster(), driver.name, { attending: toggle.checked })));
    const name = document.createElement('span');
    name.textContent = driver.name;
    const state = document.createElement('span');
    state.className = 'attendee-state';
    state.textContent = driver.attending ? 'Coming' : 'Not coming';
    label.append(toggle, name, state);
    item.append(label);
    return item;
  }

  function render() {
    const roster = [...getRoster()].sort((a, b) => a.name.localeCompare(b.name));
    const coming = roster.filter((driver) => driver.attending).length;
    summary.textContent = roster.length === 0 ? 'No drivers yet.' : `${coming} of ${roster.length} coming`;
    list.replaceChildren(...roster.map(row));
    input.disabled = !canWrite();
    addButton.disabled = !canWrite();
  }

  return { render };
}
