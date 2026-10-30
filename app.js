import { GROUPS } from './groups.js';
import { pickIndex, spinTo } from './draw.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const RADIUS = 96;

const state = {
  groups: new Set(Object.keys(GROUPS)),
  leftOut: new Set(),
  rotation: 0,
  spinning: false,
};

const groupsEl = document.querySelector('#groups');
const rotor = document.querySelector('#rotor');
const spinButton = document.querySelector('#spin');
const result = document.querySelector('#result');

const driverKey = (group, name) => `${group}:${name}`;

function entrants() {
  return Object.entries(GROUPS)
    .filter(([group]) => state.groups.has(group))
    .flatMap(([group, names]) => names
      .filter((name) => !state.leftOut.has(driverKey(group, name)))
      .map((name) => ({ group, name })));
}

function renderGroups() {
  groupsEl.replaceChildren(...Object.entries(GROUPS).map(([group, names]) => {
    const included = state.groups.has(group);
    const card = document.createElement('fieldset');
    card.className = included ? 'group' : 'group off';
    card.style.setProperty('--group-color', `var(--group-${group.toLowerCase()})`);

    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = included;
    checkbox.disabled = state.spinning;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) state.groups.add(group);
      else state.groups.delete(group);
      render();
    });
    label.append(checkbox, `Group ${group}`);

    const chips = document.createElement('div');
    chips.className = 'chips';
    chips.append(...names.map((name) => {
      const key = driverKey(group, name);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = name;
      chip.disabled = !included || state.spinning;
      chip.setAttribute('aria-pressed', String(!state.leftOut.has(key)));
      chip.addEventListener('click', () => {
        if (state.leftOut.has(key)) state.leftOut.delete(key);
        else state.leftOut.add(key);
        render();
      });
      return chip;
    }));

    card.append(label, chips);
    return card;
  }));
}

function svg(tag, attrs, text) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  if (text) el.textContent = text;
  return el;
}

// Angles are clockwise from 12 o'clock, matching sliceUnderPointer in draw.js
function point(angle, radius) {
  const rad = (angle * Math.PI) / 180;
  return `${(radius * Math.sin(rad)).toFixed(3)} ${(-radius * Math.cos(rad)).toFixed(3)}`;
}

function renderWheel(pool) {
  if (pool.length === 0) {
    rotor.replaceChildren(
      svg('circle', { class: 'empty', r: RADIUS }),
      svg('text', { class: 'empty-label', 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, 'Pick at least one driver'),
    );
    return;
  }

  const sliceAngle = 360 / pool.length;
  const fontSize = Math.min(12, Math.max(6.5, 150 / pool.length));
  const slices = pool.map(({ group, name }, i) => {
    const start = i * sliceAngle;
    const fill = `var(--group-${group.toLowerCase()})`;
    const shape = pool.length === 1
      ? svg('circle', { class: 'slice', r: RADIUS, style: `fill: ${fill}` })
      : svg('path', {
        class: 'slice',
        style: `fill: ${fill}`,
        d: `M0 0 L${point(start, RADIUS)} A${RADIUS} ${RADIUS} 0 ${sliceAngle > 180 ? 1 : 0} 1 ${point(start + sliceAngle, RADIUS)} Z`,
      });
    const label = svg('text', {
      class: 'slice-label',
      'font-size': fontSize,
      'text-anchor': 'end',
      'dominant-baseline': 'middle',
      transform: `rotate(${start + sliceAngle / 2}) translate(0 ${-(RADIUS - 8)}) rotate(-90)`,
    }, name);
    const slice = svg('g', {});
    slice.append(shape, label);
    return slice;
  });

  rotor.replaceChildren(...slices, svg('circle', { class: 'hub', r: 10 }));
}

function render() {
  const pool = entrants();
  renderGroups();
  renderWheel(pool);
  spinButton.disabled = state.spinning || pool.length === 0;
}

function spin() {
  const pool = entrants();
  if (state.spinning || pool.length === 0) return;

  const index = pickIndex(pool.length);
  state.rotation = spinTo(state.rotation, index, pool.length);
  state.spinning = true;
  result.replaceChildren();
  render();

  rotor.addEventListener('transitionend', () => {
    state.spinning = false;
    const { name, group } = pool[index];
    const strong = document.createElement('strong');
    strong.textContent = name;
    const groupLabel = document.createElement('span');
    groupLabel.textContent = `Group ${group}`;
    result.replaceChildren(strong, groupLabel);
    render();
  }, { once: true });
  rotor.style.transform = `rotate(${state.rotation}deg)`;
}

spinButton.addEventListener('click', spin);
render();
