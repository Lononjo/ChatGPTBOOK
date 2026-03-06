'use strict';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const startDateEl  = document.getElementById('startDate');
const todayBtn     = document.getElementById('todayBtn');
const yearsEl      = document.getElementById('years');
const monthsEl     = document.getElementById('months');
const weeksEl      = document.getElementById('weeks');
const daysEl       = document.getElementById('days');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn     = document.getElementById('resetBtn');
const resultCard   = document.getElementById('resultCard');
const resultDate   = document.getElementById('resultDate');
const resultWeekday = document.getElementById('resultWeekday');
const breakdownBody = document.getElementById('breakdownBody');
const totalDaysEl  = document.getElementById('totalDays');
const opWordEl     = document.getElementById('opWord');
const footerYear   = document.getElementById('footerYear');

// ── Helpers ───────────────────────────────────────────────────────────────────
const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS   = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse a yyyy-mm-dd string into a local Date (no timezone shift). */
function parseLocal(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date as "Month D, YYYY" */
function formatDate(date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Ordinal suffix */
function ordinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Count calendar days between two dates (absolute). */
function daysBetween(a, b) {
  const ms = Math.abs(b - a);
  return Math.round(ms / 86_400_000);
}

// ── Core calculation ──────────────────────────────────────────────────────────
function calculate() {
  if (!startDateEl.value) {
    startDateEl.focus();
    return;
  }

  const op     = document.querySelector('input[name="operation"]:checked').value;
  const years  = parseInt(yearsEl.value,  10) || 0;
  const months = parseInt(monthsEl.value, 10) || 0;
  const weeks  = parseInt(weeksEl.value,  10) || 0;
  const days   = parseInt(daysEl.value,   10) || 0;

  const sign   = op === 'add' ? 1 : -1;

  // Build result date step by step so month arithmetic is predictable
  const start  = parseLocal(startDateEl.value);
  const result = new Date(start);

  result.setFullYear(result.getFullYear() + sign * years);
  result.setMonth(result.getMonth()       + sign * months);
  result.setDate(result.getDate()         + sign * (weeks * 7 + days));

  // ── Display ──────────────────────────────────────────────────────────────
  resultDate.textContent    = formatDate(result);
  resultWeekday.textContent = WEEKDAYS[result.getDay()];
  opWordEl.textContent      = op === 'add' ? 'added' : 'subtracted';

  // Total calendar days between start and result
  const totalDays = daysBetween(start, result);
  totalDaysEl.textContent = totalDays.toLocaleString();

  // Breakdown rows
  breakdownBody.innerHTML = '';
  const rows = [
    { label: 'Years',  value: years  },
    { label: 'Months', value: months },
    { label: 'Weeks',  value: weeks  },
    { label: 'Days',   value: days   },
  ];
  rows.forEach(({ label, value }) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${label}</td><td>${value.toLocaleString()}</td>`;
    breakdownBody.appendChild(tr);
  });

  // Show additional info row: start date
  const infoTr = document.createElement('tr');
  infoTr.innerHTML = `
    <td style="color:var(--gray-600)">Start date</td>
    <td style="color:var(--gray-600)">${formatDate(start)} &nbsp;(${WEEKDAYS[start.getDay()]})</td>
  `;
  breakdownBody.appendChild(infoTr);

  resultCard.hidden = false;
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Reset ─────────────────────────────────────────────────────────────────────
function reset() {
  startDateEl.value = todayISO();
  document.querySelector('input[name="operation"][value="add"]').checked = true;
  yearsEl.value  = 0;
  monthsEl.value = 0;
  weeksEl.value  = 0;
  daysEl.value   = 0;
  resultCard.hidden = true;
}

// ── Shortcut buttons ──────────────────────────────────────────────────────────
document.querySelectorAll('.shortcut-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const d = parseInt(btn.dataset.days, 10);
    // Reset duration fields and set to add
    yearsEl.value  = 0;
    monthsEl.value = 0;
    weeksEl.value  = 0;
    document.querySelector('input[name="operation"][value="add"]').checked = true;

    if (d % 365 === 0 && d >= 365) {
      yearsEl.value = d / 365;
      daysEl.value  = 0;
    } else if (d % 7 === 0) {
      weeksEl.value = d / 7;
      daysEl.value  = 0;
    } else {
      daysEl.value = d;
    }

    if (!startDateEl.value) startDateEl.value = todayISO();
    calculate();
  });
});

// ── Event wiring ──────────────────────────────────────────────────────────────
todayBtn.addEventListener('click', () => {
  startDateEl.value = todayISO();
});

calculateBtn.addEventListener('click', calculate);
resetBtn.addEventListener('click', reset);

// Allow Enter key on number inputs to trigger calculation
[yearsEl, monthsEl, weeksEl, daysEl].forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter') calculate();
  });
});

// ── Init ──────────────────────────────────────────────────────────────────────
startDateEl.value     = todayISO();
footerYear.textContent = new Date().getFullYear();
