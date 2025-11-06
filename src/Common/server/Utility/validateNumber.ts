export default function validateNumber(value: unknown): boolean {
    // Ensure it's a number
    if (typeOf(value) !== "number") {
        return false;
    }

    // Check for NaN
    const num = value as number;
    if (num !== num) {
        return false;
    }

    return true;
}
