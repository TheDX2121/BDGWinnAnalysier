const menuButton = document.getElementById("menuButton");
const sideMenu = document.getElementById("sideMenu");
const closeMenu = document.getElementById("closeMenu");
const menuOverlay = document.getElementById("menuOverlay");

const outcomeInput = document.getElementById("outcomeInput");
const inputCount = document.getElementById("inputCount");
const analyzeButton = document.getElementById("analyzeButton");

const totalOutcomes = document.getElementById("totalOutcomes");
const totalEvents = document.getElementById("totalEvents");

const selectedPattern = document.getElementById("selectedPattern");
const patternSelect = document.getElementById("patternSelect");

const bigPercent = document.getElementById("bigPercent");
const smallPercent = document.getElementById("smallPercent");

const bigCount = document.getElementById("bigCount");
const smallCount = document.getElementById("smallCount");

const recentEvents = document.getElementById("recentEvents");
const patternsGrid = document.getElementById("patternsGrid");

/* ---------------------------
   Menu
---------------------------- */

function openMenu() {
  sideMenu.classList.add("open");
  menuOverlay.classList.add("show");
}

function closeSideMenu() {
  sideMenu.classList.remove("open");
  menuOverlay.classList.remove("show");
}

menuButton.addEventListener("click", openMenu);
closeMenu.addEventListener("click", closeSideMenu);
menuOverlay.addEventListener("click", closeSideMenu);

/* ---------------------------
   Parse outcomes
---------------------------- */

function parseOutcomes(value) {
  return value
    .split(/[\s,]+/)
    .map(Number)
    .filter(number =>
      Number.isInteger(number) &&
      number >= 0 &&
      number <= 9
    );
}

/* ---------------------------
   Big / Small
---------------------------- */

function getSize(number) {
  return number >= 5 ? "Big" : "Small";
}

/* ---------------------------
   Sliding window
---------------------------- */

function generateEvents(numbers) {
  const events = [];

  for (let i = 0; i < numbers.length - 2; i++) {
    const first = numbers[i];
    const second = numbers[i + 1];
    const next = numbers[i + 2];

    events.push({
      first,
      second,
      next,
      type: getSize(next)
    });
  }

  return events;
}

/* ---------------------------
   Input counter
---------------------------- */

outcomeInput.addEventListener("input", () => {
  const numbers = parseOutcomes(outcomeInput.value);

  inputCount.textContent =
    `${numbers.length} outcome${numbers.length === 1 ? "" : "s"}`;
});

/* ---------------------------
   Analyze
---------------------------- */

analyzeButton.addEventListener("click", () => {
  const numbers = parseOutcomes(outcomeInput.value);

  if (numbers.length < 3) {
    alert("Please enter at least 3 outcomes.");
    return;
  }

  const events = generateEvents(numbers);

  totalOutcomes.textContent = numbers.length;
  totalEvents.textContent = events.length;

  renderRecentEvents(events);
  renderPatterns(events);
});

/* ---------------------------
   Recent events
---------------------------- */

function renderRecentEvents(events) {
  recentEvents.innerHTML = "";

  const recent = events.slice(-10).reverse();

  recent.forEach(event => {
    const item = document.createElement("div");

    item.className = "event";

    item.innerHTML = `
      <span class="event-sequence">
        ${event.first}-${event.second}
        → ${event.next}
      </span>

      <span class="event-type">
        ${event.type}
      </span>
    `;

    recentEvents.appendChild(item);
  });
}

/* ---------------------------
   Pattern statistics
---------------------------- */

function buildPatternStats(events) {
  const stats = {};

  events.forEach(event => {
    const key = `${event.first}-${event.second}`;

    if (!stats[key]) {
      stats[key] = {
        total: 0,
        big: 0,
        small: 0
      };
    }

    stats[key].total++;

    if (event.type === "Big") {
      stats[key].big++;
    } else {
      stats[key].small++;
    }
  });

  return stats;
}

/* ---------------------------
   Render patterns
---------------------------- */

function renderPatterns(events) {
  const stats = buildPatternStats(events);

  patternsGrid.innerHTML = "";

  Object.keys(stats)
    .sort((a, b) => {
      const [a1, a2] = a.split("-").map(Number);
      const [b1, b2] = b.split("-").map(Number);

      return (a1 * 10 + a2) - (b1 * 10 + b2);
    })
    .forEach(pattern => {
      const data = stats[pattern];

      const big = (data.big / data.total) * 100;
      const small = (data.small / data.total) * 100;

      const item = document.createElement("div");

      item.className = "pattern-item";

      item.innerHTML = `
        <strong>${pattern}</strong>
        <div>
          Total ${data.total}
          · Big ${big.toFixed(1)}%
          · Small ${small.toFixed(1)}%
        </div>
      `;

      patternsGrid.appendChild(item);
    });

  updateSelectedPattern(stats);
}

/* ---------------------------
   Selected pattern
---------------------------- */

patternSelect.addEventListener("change", () => {
  selectedPattern.textContent = patternSelect.value;

  const numbers = parseOutcomes(outcomeInput.value);
  const events = generateEvents(numbers);

  const stats = buildPatternStats(events);

  updateSelectedPattern(stats);
});

function updateSelectedPattern(stats) {
  const pattern = patternSelect.value;
  const data = stats[pattern];

  selectedPattern.textContent = pattern;

  if (!data) {
    bigPercent.textContent = "0%";
    smallPercent.textContent = "0%";

    bigCount.textContent = "0 records";
    smallCount.textContent = "0 records";

    return;
  }

  const big = (data.big / data.total) * 100;
  const small = (data.small / data.total) * 100;

  bigPercent.textContent = `${big.toFixed(1)}%`;
  smallPercent.textContent = `${small.toFixed(1)}%`;

  bigCount.textContent =
    `${data.big} record${data.big === 1 ? "" : "s"}`;

  smallCount.textContent =
    `${data.small} record${data.small === 1 ? "" : "s"}`;
}

/* ---------------------------
   Generate all 100 patterns
---------------------------- */

function generateAllPatterns() {
  patternsGrid.innerHTML = "";

  for (let first = 0; first <= 9; first++) {
    for (let second = 0; second <= 9; second++) {

      const pattern = `${first}-${second}`;

      const item = document.createElement("div");

      item.className = "pattern-item";

      item.innerHTML = `
        <strong>${pattern}</strong>
        <div>
          No data
        </div>
      `;

      patternsGrid.appendChild(item);
    }
  }
}

generateAllPatterns();