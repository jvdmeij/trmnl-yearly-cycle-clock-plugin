// Data & Config
// Initialize Hemisphere First
let hemisphere = 'northern';
if (typeof window.trmnlHemisphere !== 'undefined') {
    hemisphere = window.trmnlHemisphere;
}

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// Season boundaries (approx astronomical):
// Winter: Dec 21 (~350) -> Mar 20 (~79)
// Spring: Mar 21 (~79) -> Jun 20 (~170)
// Summer: Jun 21 (~170) -> Sep 22 (~262)
// Autumn: Sep 23 (~262) -> Dec 20 (~350)

const northernSeasonBoundaries = [
    79,  // Spring Starts
    171, // Summer Starts
    259, // Autumn Starts
    350  // Winter Starts
];

const southernSeasonBoundaries = [
    79,  // Autumn Starts
    171, // Winter Starts
    259, // Spring Starts
    350  // Summer Starts
];

const seasonBoundaries = (hemisphere === 'southern') ? southernSeasonBoundaries : northernSeasonBoundaries;

// Northern Hemisphere Data
const northernSeasonData = [
    { emoji: "❄︎", start: 350, end: 79 },
    { emoji: "🌱", start: 79, end: 170 },
    { emoji: "🌞", start: 170, end: 262 },
    { emoji: "🍂", start: 262, end: 350 }
];

// Southern Hemisphere Data (Seasons flipped)
const southernSeasonData = [
    { emoji: "🌞", start: 350, end: 79 },
    { emoji: "🍂", start: 79, end: 170 },
    { emoji: "❄︎", start: 170, end: 262 },
    { emoji: "🌱", start: 262, end: 350 }
];
// Select Season Data
const seasonData = (hemisphere === 'southern') ? southernSeasonData : northernSeasonData;
// Select Season Data
const northernMonthEmojis = [
    "⛄", // Jan
    "💕", // Feb
    "🌷", // Mar
    "🐣", // Apr
    "🐝", // May
    "☀︎", // Jun
    "🍦", // Jul
    "🌻", // Aug
    "🍏", // Sep
    "🎃", // Oct
    "🍂", // Nov
    "🎄"  // Dec
];

const southernMonthEmojis = [
    "☀︎", // Jan (Summer)
    "🍦", // Feb (Summer)
    "🌻", // Mar (Autumn)
    "🍂", // Apr (Autumn)
    "🍏", // May (Autumn)
    "⛄", // Jun (Winter)
    "❄︎", // Jul (Winter)
    "🧣", // Aug (Winter)
    "🌱", // Sep (Spring)
    "🌷", // Oct (Spring)
    "🐝", // Nov (Spring)
    "🎄"  // Dec (Summer - keeping Holiday context)
];

const monthEmojis = (hemisphere === 'southern') ? southernMonthEmojis : northernMonthEmojis;

// Elements
const center = document.getElementById('center');
const seasonsDisk = document.getElementById('seasons-disk');

// Helpers
function createLine(angle, parent, isSeason = false) {
    const line = document.createElement('div');
    line.className = isSeason ? 'season-line' : 'line month-line';
    line.style.transform = `rotate(${angle}deg)`;
    parent.appendChild(line);
}

function createLabel(text, angle, radiusVmin, parent, index = null) {
    const label = document.createElement('div');
    label.className = 'label ' + (parent === seasonsDisk ? 'season-label' : 'month-label');
    label.innerHTML = text;

    // 0 deg is UP. CSS rotate angles are CW from UP (if we set it up right).
    // Current setup:
    // Month 0 is at 0 degrees.
    // label rotation: rotate(angle) translate(0, -radius) rotate(-angle)
    // This places it at 'angle' direction, 'radius' distance.
    // And keeps text upright.

    label.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translate(0, calc(${radiusVmin} * -1)) rotate(-${angle}deg)`;

    // Add a class based on text (strip HTML tags if any) to allow specific targeting
    // e.g. label-JAN, label-Win
    const safeClass = 'label-' + text.replace(/<[^>]*>/g, '');
    label.classList.add(safeClass);

    if (index !== null && parent === seasonsDisk) {
        label.classList.add('season-pos-' + index);
    }

    label.style.left = '50%';
    label.style.top = '50%';
    parent.appendChild(label);
}

function createEmoji(emoji, angle, radiusVmin, parent) {
    const el = document.createElement('div');
    el.className = 'emoji-item';
    el.textContent = emoji;
    // Fixed size and opacity
    el.style.fontSize = 'var(--emoji-size)';
    el.style.opacity = '1';

    el.style.left = '50%';
    el.style.top = '50%';
    // Use same rotation logic as labels to keep them upright and positioned
    el.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translate(0, calc(${radiusVmin} * -1)) rotate(-${angle}deg)`;

    parent.appendChild(el);
}

// 1. Build Layout

// Month Lines (0 to 330)
for (let i = 0; i < 12; i++) {
    createLine(i * 30, center);
}

// Month Labels
months.forEach((m, i) => {
    createLabel(m, i * 30 + 15, "var(--month-label-radius)", center);
});

// Season Lines
seasonBoundaries.forEach(angle => {
    createLine(angle, seasonsDisk, true);
});



// Emojis

// Season Emojis (Inner) - Fixed placement
seasonData.forEach(s => {
    let start = s.start;
    let end = s.end;
    if (end < start) end += 360;
    let mid = (start + end) / 2;
    createEmoji(s.emoji, mid, "var(--season-emoji-radius)", seasonsDisk);
});

// Month Emojis (Outer) - Fixed placement
months.forEach((m, i) => {
    const angle = i * 30 + 15;
    // Season disk radius is 20vmin (40vmin dia).
    // Label is at 42vmin.
    // Midpoint roughly 31vmin.
    const emoji = monthEmojis[i];
    createEmoji(emoji, angle, "var(--month-emoji-radius)", center);
});


// Clock Hand
const hand = document.getElementById('hand');

function updateClock() {
    let now;
    // Check if we have a server-provided timestamp (from Liquid)
    // We check for undefined or if it's the unparsed Liquid string (in local dev) which results in NaN usually or error?
    // In local dev `window.trmnlTimestamp` might be NaN if the {{ }} caused syntax error or 0.
    if (typeof window.trmnlTimestamp !== 'undefined' && !isNaN(window.trmnlTimestamp) && window.trmnlTimestamp !== 0) {
        now = new Date(window.trmnlTimestamp * 1000);
    } else {
        now = new Date();
    }

    const start = new Date(now.getFullYear(), 0, 0); // Dec 31 previous year basically
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    // dayOfYear is 1-based usually
    const dayOfYear = Math.floor(diff / oneDay);

    const isLeap = (year) => new Date(year, 1, 29).getMonth() === 1;
    const daysInYear = isLeap(now.getFullYear()) ? 366 : 365;

    // Fraction of year
    const fraction = dayOfYear / daysInYear; // 0 to 1
    const degrees = fraction * 360;

    // Hand rotation.
    // 0 deg = Jan 1 start.
    // Our hand points DOWN at rotate(0) because of top/height logic.
    // But we want it to point UP at 0 degrees.
    // So we add 180.

    // Better:
    const exactDay = diff / oneDay;
    const exactDegrees = (exactDay / daysInYear) * 360;

    hand.style.transform = `rotate(${exactDegrees + 180}deg)`;
}

updateClock();
// No setInterval needed for static TRMNL displays, but useful if running in browser
if (typeof window.trmnlTimestamp === 'undefined' || isNaN(window.trmnlTimestamp) || window.trmnlTimestamp === 0) {
    setInterval(updateClock, 60000);
}
