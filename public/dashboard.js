const token =
  localStorage.getItem("analyzerToken");

if (!token) {
  window.location.href = "/";
}

const datasetSelect =
  document.getElementById("datasetSelect");

const outcomeInput =
  document.getElementById("outcomeInput");

const addBtn =
  document.getElementById("addBtn");

const statsContainer =
  document.getElementById("stats");

const logoutBtn =
  document.getElementById("logoutBtn");

const headers = {
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json"
};

async function loadDatasets() {
  const response = await fetch(
    "/api/datasets",
    {
      headers
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  datasetSelect.innerHTML =
    `<option value="">Select Dataset</option>`;

  data.datasets.forEach(dataset => {

    const option =
      document.createElement("option");

    option.value = dataset._id;
    option.textContent = dataset.name;

    datasetSelect.appendChild(option);
  });
}

async function loadStats(datasetId) {
  if (!datasetId) {
    statsContainer.textContent =
      "Select a dataset.";

    return;
  }

  const response = await fetch(
    `/api/analysis/${datasetId}/patterns`,
    {
      headers
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  statsContainer.innerHTML = "";

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
        data.stats.find(
          item =>
            item.first === first &&
            item.second === second
        );

      const total =
        stat?.total || 0;

      const big =
        stat?.bigPercent || 0;

      const small =
        stat?.smallPercent || 0;

      const card =
        document.createElement("div");

      card.className = "stat";

      card.innerHTML = `
        <strong>${first}-${second}</strong>

        <div>
          Total: ${total}
        </div>

        <div>
          Big: ${big}%
        </div>

        <div>
          Small: ${small}%
        </div>
      `;

      statsContainer.appendChild(card);
    }
  }
}

datasetSelect.addEventListener(
  "change",
  () => {
    loadStats(
      datasetSelect.value
    );
  }
);

addBtn.addEventListener(
  "click",
  async () => {

    const datasetId =
      datasetSelect.value;

    if (!datasetId) {
      alert("Select a dataset first.");
      return;
    }

    const numbers =
      outcomeInput.value
        .split(",")
        .map(value => Number(value.trim()))
        .filter(value => !Number.isNaN(value));

    if (!numbers.length) {
      alert("Enter outcomes first.");
      return;
    }

    addBtn.disabled = true;

    try {

      const response =
        await fetch(
          `/api/outcomes/${datasetId}`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              numbers
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      outcomeInput.value = "";

      await loadStats(datasetId);

    } catch (error) {
      alert(error.message);
    }

    addBtn.disabled = false;
  }
);

logoutBtn.addEventListener(
  "click",
  () => {
    localStorage.removeItem(
      "analyzerToken"
    );

    window.location.href = "/";
  }
);

loadDatasets().catch(error => {
  console.error(error);
});