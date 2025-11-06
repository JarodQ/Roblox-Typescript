/**
 * Validates that a table:
 * - Is a Lua-style object (not null or undefined)
 * - Has keys of a specific type
 * - Has values that pass a custom validator
 */
type ValidKeyType = "string" | "number" | "boolean";

export default function validateSimpleTable(
    tbl: unknown,
    keyType: ValidKeyType,
    validator: (value: unknown) => boolean,
): boolean {
    if (typeOf(tbl) !== "table") {
        return false;
    }

    for (const [key, value] of pairs(tbl as Record<ValidKeyType, unknown>)) {
        if (typeOf(key) !== keyType) {
            return false;
        }

        if (!validator(value)) {
            return false;
        }
    }

    return true;
}

