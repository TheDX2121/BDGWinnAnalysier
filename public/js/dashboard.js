let datasets = [];
let activeDataset = null;
let allStats = [];

const datasetButton =
  document.getElementById(
    "datasetButton"
  );

const datasetPanel =
  document.getElementById(
    "datasetPanel"
  );

const datasetList =
  document.getElementById(
    "datasetList"
  );

const datasetName =
  document.getElementById(
    "datasetName"
  );

const patternSelect =
  document.getElementById(
    "patternSelect"
  );

const liveOutcome =
  document.getElementById(
    "liveOutcome"
  );

const liveStatus =
  document.getElementById(
    "liveStatus"
  );

const importStatus =
  document.getElementById(
    "importStatus"
  );

function logout() {
  localStorage.removeItem(
    "analyzer_token"
  );

  location.href = "/";
}

document
  .getElementById("logoutButton")
  .addEventListener(
    "click",
    logout
  );


datasetButton.addEventListener(
  "click",
  () => {
    datasetPanel.classList.toggle(
      "hidden"
    );
  }
);


document
  .getElementById("closeDataset")
  .addEventListener(
    "click",
    () => {
      datasetPanel.classList.add(
        "hidden"
      );
    }
  );


async function loadDatasets() {

  try {

    const data =
      await API.get(
        "/api/datasets"
      );

    datasets =
      data.datasets || [];

    renderDatasets();

    if (!datasets.length) {

      await createDataset(
        "Main Dataset"
      );

      return;
    }

    const savedId =
      localStorage.getItem(
        "active_dataset"
      );

    activeDataset =
      datasets.find(
        item =>
          item._id === savedId
      ) || datasets[0];

    await activateDataset(
      activeDataset._id
    );

  } catch (error) {

    alert(error.message);
  }
}


function renderDatasets() {

  datasetList.innerHTML = "";

  datasets.forEach(dataset => {

    const button =
      document.createElement(
        "button"
      );

    button.className =
      "dataset-item";

    if (
      activeDataset &&
      dataset._id ===
        activeDataset._id
    ) {
      button.classList.add(
        "active"
      );
    }

    button.innerHTML = `
      <span>${escapeHtml(dataset.name)}</span>
      <small>OPEN</small>
    `;

    button.addEventListener(
      "click",
      () =>
        activateDataset(
          dataset._id
        )
    );

    datasetList.appendChild(
      button
    );
  });
}


async function createDataset(
  name
) {

  try {

    const data =
      await API.post(
        "/api/datasets",
        { name }
      );

    datasets.unshift(
      data.dataset
    );

    renderDatasets();

    await activateDataset(
      data.dataset._id
    );

  } catch (error) {

    alert(error.message);
  }
}


document
  .getElementById(
    "createDatasetButton"
  )
  .addEventListener(
    "click",
    async () => {

      const input =
        document.getElementById(
          "newDatasetName"
        );

      const name =
        input.value.trim();

      if (!name) return;

      await createDataset(
        name
      );

      input.value = "";
    }
  );


async function activateDataset(
  datasetId
) {

  activeDataset =
    datasets.find(
      item =>
        item._id === datasetId
    );

  if (!activeDataset) return;

  localStorage.setItem(
    "active_dataset",
    datasetId
  );

  datasetName.textContent =
    activeDataset.name;

  datasetPanel.classList.add(
    "hidden"
  );

  renderDatasets();

  await loadAnalysis();

  await loadRecentWindow();
}


async function loadAnalysis() {

  if (!activeDataset) return;

  try {

    const data =
      await API.get(
        `/api/analysis/${activeDataset._id}/patterns`
      );

    allStats =
      data.stats || [];

    renderPatternSelector();

    renderPatternTable();

    if (
      patternSelect.value
    ) {
      renderSelectedPattern();
    }

  } catch (error) {

    console.error(error);
  }
}


function getStat(
  first,
  second
) {

  return allStats.find(
    stat =>
      stat.first === first &&
      stat.second === second
  );
}


function renderPatternSelector() {

  patternSelect.innerHTML = "";

  for (
    let first = 0;
    first <= 9;
    first++
  ) {

    for (
      let second = 0;
      second <= 9;
      second++
    ) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        `${first}-${second}`;

      option.textContent =
        `${first} - ${second}`;

      patternSelect.appendChild(
        option
      );
    }
  }
}


patternSelect.addEventListener(
  "change",
  renderSelectedPattern
);


function renderSelectedPattern() {

  const [
    first,
    second
  ] =
    patternSelect.value
      .split("-")
      .map(Number);

  const stat =
    getStat(
      first,
      second
    );

  document.getElementById(
    "selectedPattern"
  ).textContent =
    `${first} - ${second}`;

  document.getElementById(
    "totalCount"
  ).textContent =
    stat?.total || 0;

  document.getElementById(
    "bigCount"
  ).textContent =
    stat?.bigCount || 0;

  document.getElementById(
    "smallCount"
  ).textContent =
    stat?.smallCount || 0;

  document.getElementById(
    "bigPercent"
  ).textContent =
    `${stat?.bigPercent || 0}%`;

  document.getElementById(
    "smallPercent"
  ).textContent =
    `${stat?.smallPercent || 0}%`;

  renderNextNumbers(
    stat?.nextNumbers || []
  );
}


function renderNextNumbers(
  numbers
) {

  const container =
    document.getElementById(
      "nextNumbers"
    );

  container.innerHTML = "";

  if (!numbers.length) {

    container.innerHTML =
      `<span class="empty">
        No data yet
      </span>`;

    return;
  }

  const sorted =
    [...numbers].sort(
      (a, b) =>
        b.count - a.count
    );

  sorted.forEach(item => {

    const span =
      document.createElement(
        "span"
      );

    span.textContent =
      `${item.number}: ${item.count}`;

    container.appendChild(
      span
    );
  });
}


function renderPatternTable() {

  const container =
    document.getElementById(
      "patternTable"
    );

  container.innerHTML = "";

  for (
    let first = 0;
    first <= 9;
    first++
  ) {

    for (
      let second = 0;
      second <= 9;
      second++
    ) {

      const stat =
        getStat(
          first,
          second
        );

      const cell =
        document.createElement(
          "div"
        );

      cell.className =
        "pattern-cell";

      const bigPercent =
        stat?.bigPercent || 0;

      const smallPercent =
        stat?.smallPercent || 0;

      cell.innerHTML = `
        <div class="pattern-name">
          ${first}-${second}
        </div>

        <div class="pattern-total">
          Total: ${stat?.total || 0}
        </div>

        <div class="pattern-percent">
          B ${bigPercent}% · S ${smallPercent}%
        </div>
      `;

      cell.addEventListener(
        "click",
        () => {

          patternSelect.value =
            `${first}-${second}`;

          renderSelectedPattern();

          window.scrollTo({
            top: 250,
            behavior: "smooth"
          });
        }
      );

      container.appendChild(
        cell
      );
    }
  }
}


async function addLiveOutcome() {

  if (!activeDataset) {

    liveStatus.textContent =
      "Select a dataset first.";

    return;
  }

  const value =
    Number(
      liveOutcome.value
    );

  if (
    !Number.isInteger(value) ||
    value < 0 ||
    value > 9
  ) {

    liveStatus.textContent =
      "Enter a number from 0 to 9.";

    return;
  }

  try {

    const data =
      await API.post(
        `/api/outcomes/${activeDataset._id}`,
        {
          numbers: [value]
        }
      );

    liveOutcome.value = "";

    const imported =
      data.imported || 0;

    liveStatus.textContent =
      imported
        ? `Outcome ${value} recorded.`
        : "Outcome already exists in imported overlap.";

    await loadAnalysis();

    await loadRecentWindow();

  } catch (error) {

    liveStatus.textContent =
      error.message;
  }
}


document
  .getElementById(
    "addOutcomeButton"
  )
  .addEventListener(
    "click",
    addLiveOutcome
  );


liveOutcome.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {
      addLiveOutcome();
    }
  }
);


async function importHistory() {

  if (!activeDataset) {

    importStatus.textContent =
      "Select a dataset first.";

    return;
  }

  const input =
    document.getElementById(
      "historyInput"
    );

  const text =
    input.value.trim();

  if (!text) return;

  const numbers =
    text
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);

  if (
    numbers.some(
      number =>
        !Number.isInteger(number) ||
        number < 0 ||
        number > 9
    )
  ) {

    importStatus.textContent =
      "Only digits 0-9 are allowed.";

    return;
  }

  try {

    const data =
      await API.post(
        `/api/outcomes/${activeDataset._id}/import`,
        {
          numbers
        }
      );

    importStatus.textContent =
      `Imported ${data.imported} new outcomes. Skipped ${data.skipped} overlapping outcomes.`;

    input.value = "";

    await loadAnalysis();

    await loadRecentWindow();

  } catch (error) {

    importStatus.textContent =
      error.message;
  }
}


document
  .getElementById(
    "importButton"
  )
  .addEventListener(
    "click",
    importHistory
  );


async function loadRecentWindow() {

  if (!activeDataset) return;

  try {

    const data =
      await API.get(
        `/api/outcomes/${activeDataset._id}`
      );

    const outcomes =
      data.outcomes || [];

    if (!outcomes.length) {

      updateWindow(
        null,
        null,
        null
      );

      return;
    }

    const length =
      outcomes.length;

    const a =
      length >= 3
        ? outcomes[length - 3].number
        : null;

    const b =
      length >= 2
        ? outcomes[length - 2].number
        : null;

    const c =
      length >= 1
        ? outcomes[length - 1].number
        : null;

    updateWindow(
      a,
      b,
      c
    );

  } catch (error) {

    console.error(error);
  }
}


function updateWindow(
  a,
  b,
  c
) {

  const boxes =
    document.querySelectorAll(
      ".number-box strong"
    );

  boxes[0].textContent =
    a ?? "—";

  boxes[1].textContent =
    b ?? "—";

  boxes[2].textContent =
    c ?? "—";

  const result =
    document.getElementById(
      "lastResult"
    );

  if (c === null) {

    result.textContent = "—";

    return;
  }

  result.textContent =
    c >= 5
      ? "BIG"
      : "SMALL";
}


function escapeHtml(
  value
) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    value;

  return div.innerHTML;
}


if (
  !localStorage.getItem(
    "analyzer_token"
  )
) {
  location.href = "/";
} else {
  loadDatasets();
}