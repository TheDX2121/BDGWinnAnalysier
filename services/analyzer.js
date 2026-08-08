async function processNewOutcome(
  datasetId,
  outcome
) {
  const previousTwo =
    await Outcome.find({
      datasetId,

      sequence: {
        $lt: outcome.sequence
      }
    })
      .sort({
        sequence: -1
      })
      .limit(2);

  if (previousTwo.length < 2) {
    return {
      event: null,
      stat: null
    };
  }

  const first =
    previousTwo[1].number;

  const second =
    previousTwo[0].number;

  const next =
    outcome.number;

  const resultType =
    getSize(next);

  /*
    Safety check:
    इस outcome का event पहले से बना है
    तो statistics दोबारा increment नहीं होगी।
  */

  const existingEvent =
    await Event.findOne({
      datasetId,
      sequence: outcome.sequence
    });

  if (existingEvent) {
    return {
      event: existingEvent,
      stat: await PatternStat.findOne({
        datasetId,
        first,
        second
      })
    };
  }

  const event =
    await Event.create({
      datasetId,
      first,
      second,
      next,
      resultType,
      sequence: outcome.sequence
    });

  const stat =
    await updatePatternStat(
      datasetId,
      first,
      second,
      resultType
    );

  return {
    event,
    stat
  };
}