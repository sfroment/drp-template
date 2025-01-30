export function generateRandomId(length = 32): string {
	const array = new Uint8Array(length / 2);
	crypto.getRandomValues(array);

	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
		"",
	);
}
