/**
 * Validates that a value is a Vector3 and contains no NaN components.
 */
export default function validateVector3(value: unknown): boolean {
    if (typeOf(value) !== "Vector3") {
        return false;
    }

    const vector = value as Vector3;

    // Check for NaN components
    if (vector.X !== vector.X || vector.Y !== vector.Y || vector.Z !== vector.Z) {
        return false;
    }

    return true;
}
