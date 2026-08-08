function validateNumbers(numbers) {
  if (!Array.isArray(numbers)) {
    return {
      valid: false,
      message: "Numbers must be an array."
    };
  }

  if (numbers.length === 0) {
    return {
      valid: false,
      message: "At least one outcome is required."
    };
  }

  for (const number of numbers) {
    if (
      !Number.isInteger(number) ||
      number < 0 ||
      number > 9
    ) {
      return {
        valid: false,
        message:
          "Only numbers from 0 to 9 are allowed."
      };
    }
  }

  return {
    valid: true
  };
}

module.exports = {
  validateNumbers
};