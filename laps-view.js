import { FINALISTS, MAX_ATTEMPTS, groupLabel } from './groups.js';
import { attemptsLeft, formatGap, formatLapTime, isPersonalBest, leaderboard, parseLapTime, recordAttempt, undoLastSave } from './laptimes.js';

const UNDO_CONFIRM_MS = 3000;

export function createLapsView({ getRoster, saveLap, canWrite }) {
  const form = document.querySelector('#lap-form');
  const driverSelect = document.querySelector('#lap-driver');
  const timeInput = document.querySelector('#lap-time');
  const saveButton = document.querySelector('#lap-save');
  const message = document.querySelector('#lap-message');
  const board = document.querySelector('#leaderboard');
  const empty = document.querySelector('#leaderboard-empty');
  const untimed = document.querySelector('#untimed');
  let confirmingUndo = null;
  let optionsKey = null;

  const rigOf = (driver) => (driver.group === null ? 'no rig' : groupLabel(driver.group));
  const attemptsText = (driver) => `${driver.attempts} of ${MAX_ATTEMPTS} attempts`;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const driver = getRoster().find(({ name }) => name === driverSelect.value);
    const ms = parseLapTime(timeInput.value);
    if (!driver) {
      message.textContent = 'Pick the driver first.';
      return;
    }
    if (attemptsLeft(driver, MAX_ATTEMPTS) === 0) {
      message.textContent = `${driver.name} has used all ${MAX_ATTEMPTS} attempts.`;
      return;
    }
    if (ms === null) {
      message.textContent = 'Type the time as it shows on screen, like 2:31.402.';
      return;
    }
    const faster = isPersonalBest(driver, ms);
    saveButton.disabled = true;
    if (await saveLap(driver.name, recordAttempt(driver, ms))) {
      const attempt = `attempt ${driver.attempts + 1} of ${MAX_ATTEMPTS}`;
      message.textContent = faster
        ? `Saved ${driver.name}'s ${attempt}: ${formatLapTime(ms)}, a new best.`
        : `Saved ${driver.name}'s ${attempt}: ${formatLapTime(ms)}. Their best is still ${formatLapTime(driver.bestLapMs)}.`;
      timeInput.value = '';
    }
    saveButton.disabled = !canWrite();
  });

  function undoButton(driver) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'link-button';
    button.disabled = !canWrite();
    button.textContent = confirmingUndo === driver.name ? 'Tap again to undo' : 'Undo last';
    button.setAttribute('aria-label', `Undo ${driver.name}'s last saved lap`);
    button.addEventListener('click', async () => {
      if (confirmingUndo !== driver.name) {
        confirmingUndo = driver.name;
        render();
        setTimeout(() => {
          if (confirmingUndo === driver.name) {
            confirmingUndo = null;
            render();
          }
        }, UNDO_CONFIRM_MS);
        return;
      }
      confirmingUndo = null;
      if (await saveLap(driver.name, undoLastSave(driver))) message.textContent = `Undid ${driver.name}'s last saved lap.`;
    });
    return button;
  }

  function cell(className, text) {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = text;
    return span;
  }

  function row(driver, position, leaderMs) {
    const item = document.createElement('li');
    item.className = position <= FINALISTS ? 'lap-row finalist' : 'lap-row';
    const who = cell('lap-name', driver.name);
    who.append(cell('lap-detail', ` · ${rigOf(driver)} · ${attemptsText(driver)}`));
    item.append(
      cell('lap-place', String(position)),
      who,
      cell('lap-time', formatLapTime(driver.bestLapMs)),
      cell('lap-gap', position === 1 ? 'Fastest' : formatGap(driver.bestLapMs - leaderMs)),
      driver.lastSave ? undoButton(driver) : cell('lap-undo-gap', ''),
    );
    return item;
  }

  function renderDriverOptions(coming) {
    // Rebuilding the list on every live update would close it under whoever is picking
    const key = coming.map((driver) => `${driver.name}|${driver.group}|${driver.attempts}`).join('\n');
    if (key === optionsKey) return;
    optionsKey = key;
    const selected = driverSelect.value;
    const options = coming.map((driver) => new Option(`${driver.name} (${rigOf(driver)}, ${attemptsText(driver)})`, driver.name));
    driverSelect.replaceChildren(new Option('Pick a driver', ''), ...options);
    driverSelect.value = coming.some((driver) => driver.name === selected) ? selected : '';
  }

  function render() {
    const coming = getRoster().filter((driver) => driver.attending).sort((a, b) => a.name.localeCompare(b.name));
    renderDriverOptions(coming);

    const ranked = leaderboard(coming);
    empty.hidden = ranked.length > 0;
    const rows = ranked.map((driver, i) => row(driver, i + 1, ranked[0].bestLapMs));
    if (ranked.length > FINALISTS) {
      const cutoff = document.createElement('li');
      cutoff.className = 'lap-cutoff';
      cutoff.textContent = `Top ${FINALISTS} go to the final`;
      rows.splice(FINALISTS, 0, cutoff);
    }
    board.replaceChildren(...rows);

    const waiting = coming.filter((driver) => driver.bestLapMs === null);
    untimed.textContent = waiting.length === 0 || ranked.length === 0
      ? ''
      : `No time yet: ${waiting.map((driver) => `${driver.name} (${rigOf(driver)})`).join(', ')}`;

    for (const control of [driverSelect, timeInput, saveButton]) control.disabled = !canWrite();
  }

  return { render };
}
