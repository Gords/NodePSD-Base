// RUC validation function
const validateRUC = (ruc) => {
	// Remove any non-digit characters except the hyphen from the RUC
	const cleanedRUC = ruc.replace(/[^0-9-]/g, "");

	// Split the RUC into the base number and validation digit
	const [baseNumber, validationDigit] = cleanedRUC.split("-");

	// Check if the base number has 6 to 8 digits and the validation digit is a single digit
	if (
		baseNumber.length < 6 ||
		baseNumber.length > 8 ||
		validationDigit.length !== 1
	) {
		return false;
	}

	// Apply the RUC validation algorithm
	const digits = baseNumber.split("").map(Number);
	const sum = digits.reduce(
		(acc, digit, index) => acc + digit * (baseNumber.length + 1 - index),
		0,
	);
	const calculatedDigit = 11 - (sum % 11);
	const expectedDigit = calculatedDigit === 11 ? 0 : calculatedDigit;

	return Number.parseInt(validationDigit) === expectedDigit;
};

module.exports = {
	validateRUC,
};