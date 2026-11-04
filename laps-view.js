import { RIGS_PER_HEAT } from './groups.js';
import { formatGap, formatLapTime, isPersonalBest, leaderboard, parseLapTime } from './laptimes.js';

const CLEAR_CONFIRM_MS = 3000;

export function createLapsView({ getRoster, saveLap, canWrite }) {
  const form = document.querySelector('#lap-form');
  const driverSelect = document.querySelector('#lap-driver');
  const timeInput = document.querySelector('#lap-time');
  const saveButton = document.querySelector('#lap-save');
  const message = document.querySelector('#lap-message');
  const board = document.querySelector('#leaderboard');
  const empty = document.querySelector('#leaderboard-empty');
  let confirmingClear = null;
  let optionsKey = null;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const driver = getRoster().find(({ name }) => name === driverSelect.value);
    const ms = parseLapTime(timeInput.value);
    if (!driver) {
      message.textContent = 'Pick the driver first.';
      return;
    }
    if (ms === null) {
      message.textContent = 'Type the time as it shows on screen, like 2:31.402.';
      return;
    }
    if (!isPersonalBest(driver, ms)) {
      message.textContent = `${formatLapTime(ms)} isn't faster than ${driver.name}'s best of ${formatLapTime(driver.bestLapMs)}, so it wasn't saved.`;
      return;
    }
    saveButton.disabled = true;
    if (await saveLap(driver.name, ms)) {
      message.textContent = `Saved ${driver.name}: ${formatLapTime(ms)}.`;
      timeInput.value = '';
    }
    saveButton.disabled = !canWrite();
  });

  function clearButton(driver) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'link-button';
    button.disabled = !canWrite();
    button.textContent = confirmingClear === driver.name ? 'Tap again to clear' : 'Clear';
    button.setAttribute('aria-label', `Clear ${driver.name}'s time`);
    button.addEventListener('click', async () => {
      if (confirmingClear !== driver.name) {
        confirmingClear = driver.name;
        render();
        setTimeout(() => {
          if (confirmingClear === driver.name) {
            confirmingClear = null;
            render();
          }
        }, CLEAR_CONFIRM_MS);
        return;
      }
      confirmingClear = null;
      if (await saveLap(driver.name, null)) message.textContent = `Cleared ${driver.name}'s time.`;
    });
    return button;
  }

  function row(driver, position, leaderMs) {
    const item = document.createElement('li');
    item.className = position <= RIGS_PER_HEAT ? 'lap-row finalist' : 'lap-row';
    const place = document.createElement('span');
    place.className = 'lap-place';
    place.textContent = String(position);
    const name = document.createElement('span');
    name.className = 'lap-name';
    name.textContent = driver.name;
    const time = document.createElement('span');
    time.className = 'lap-time';
    time.textContent = formatLapTime(driver.bestLapMs);
    const gap = document.createElement('span');
    gap.className = 'lap-gap';
    gap.textContent = position === 1 ? 'Fastest' : formatGap(driver.bestLapMs - leaderMs);
    item.append(place, name, time, gap, clearButton(driver));
    return item;
  }

  function renderDriverOptions(roster) {
    const coming = roster.filter((driver) => driver.attending).sort((a, b) => a.name.localeCompare(b.name));
    // Rebuilding the list on every live update would close it under whoever is picking
    const key = coming.map((driver) => driver.name).join('\n');
    if (key === optionsKey) return;
    optionsKey = key;
    const selected = driverSelect.value;
    const prompt = new Option('Pick a driver', '');
    driverSelect.replaceChildren(prompt, ...coming.map((driver) => new Option(driver.name, driver.name)));
    driverSelect.value = coming.some((driver) => driver.name === selected) ? selected : '';
  }

  function render() {
    const roster = getRoster();
    renderDriverOptions(roster);
    const ranked = leaderboard(roster);
    empty.hidden = ranked.length > 0;
    const rows = ranked.map((driver, i) => row(driver, i + 1, ranked[0].bestLapMs));
    if (ranked.length > RIGS_PER_HEAT) {
      const cutoff = document.createElement('li');
      cutoff.className = 'lap-cutoff';
      cutoff.textContent = `Top ${RIGS_PER_HEAT} go to the final`;
      rows.splice(RIGS_PER_HEAT, 0, cutoff);
    }
    board.replaceChildren(...rows);
    for (const control of [driverSelect, timeInput, saveButton]) control.disabled = !canWrite();
  }

  return { render };
}
