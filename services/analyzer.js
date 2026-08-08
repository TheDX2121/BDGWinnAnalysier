const Event = require("../models/Event");
const PatternStat = require("../models/PatternStat");

function getSize(number) {
  return number >= 5 ? "Big" : "Small";
}

function createEvents(numbers) {
  const events = [];

  for (let i = 0; i < numbers.length - 2; i++) {
    const first = numbers[i];
    const second = numbers[i + 1];
    const next = numbers[i + 2];

    events.push({
      first,
      second,
      next,
      resultType: getSize(next)
    });
  }

  return events;
}

async function processEvents(datasetId, numbers) {
  const events = createEvents(numbers);

  if (events.length === 0) {
    return {
      events: [],
      stats: []
    };
  }

  const eventDocuments = events.map(event => ({
    datasetId,
    ...event
  }));

  await Event.insertMany(eventDocuments);

  const grouped = {};

  for (const event of events) {
    const key = `${event.first}-${event.second}`;

    if (!grouped[key]) {
      grouped[key] = {
        first: event.first,
        second: event.second,
        total: 0,
        bigCount: 0,
        smallCount: 0
      };
    }

    grouped[key].total++;

    if (event.resultType === "Big") {
      grouped[key].bigCount++;
    } else {
      grouped[key].smallCount++;
    }
  }

  const stats = [];

  for (const key of Object.keys(grouped)) {
    const item = grouped[key];

    const bigPercent =
      item.total > 0
        ? (item.bigCount / item.total) * 100
        : 0;

    const smallPercent =
      item.total > 0
        ? (item.smallCount / item.total) * 100
        : 0;

    const stat = await PatternStat.findOneAndUpdate(
      {
        datasetId,
        first: item.first,
        second: item.second
      },
      {
        $inc: {
          total: item.total,
          bigCount: item.bigCount,
          smallCount: item.smallCount
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    stat.bigPercent =
      stat.total > 0
        ? (stat.bigCount / stat.total) * 100
        : 0;

    stat.smallPercent =
      stat.total > 0
        ? (stat.smallCount / stat.total) * 100
        : 0;

    await stat.save();

    stats.push(stat);
  }

  return {
    events: eventDocuments,
    stats
  };
}

module.exports = {
  getSize,
  createEvents,
  processEvents
};