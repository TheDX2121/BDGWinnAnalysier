function getSize(number) {
  if (
    !Number.isInteger(number) ||
    number < 0 ||
    number > 9
  ) {
    throw new Error(
      "Outcome must be an integer from 0 to 9."
    );
  }

  return number >= 5
    ? "Big"
    : "Small";
}

module.exports = {
  getSize
};