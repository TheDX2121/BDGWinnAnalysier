function createPattern(first, second) {
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