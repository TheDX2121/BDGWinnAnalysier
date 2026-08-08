function createPattern(first, second) {
  if (
    !Number.isInteger(first) ||
    !Number.isInteger(second) ||
    first < 0 ||
    first > 9 ||
    second < 0 ||
    second > 9
  ) {
    throw new Error(
      "Pattern values must be digits from 0 to 9."
    );
  }

  return `${first}-${second}`;
}

function generateAllPatterns() {
  const patterns = [];

  for (let first = 0; first <= 9; first++) {
    for (let second = 0; second <= 9; second++) {
      patterns.push(
        createPattern(first, second)
      );
    }
  }

  return patterns;
}

module.exports = {
  createPattern,
  generateAllPatterns
};