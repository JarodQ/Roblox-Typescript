/**
 * Validates that a value is a Humanoid instance.
 */
function taggedValidator(value: Instance): value is Humanoid {
    return typeIs(value, "Instance") && value.IsA("Humanoid");
}

/**
 * Validates the arguments passed to a shoot event.
 *
 * @param timestamp - The server timestamp used for spread calculation
 * @param blaster - The Tool instance representing the weapon
 * @param origin - The CFrame from which the shot originated
 * @param tagged - A dictionary of ray indices to Humanoid targets
 * @returns Whether the arguments are valid
 */
export function validateShootArguments(
    timestamp: number,
    blaster: Tool,
    origin: CFrame,
    tagged: Record<string, Humanoid>,
): boolean {
    // Validate timestamp is a number
    if (typeOf(timestamp) !== "number") return false;

    // Validate blaster is a Tool
    if (!typeIs(blaster, "Instance") || !blaster.IsA("Tool")) return false;

    // Validate origin is a CFrame
    if (typeOf(origin) !== "CFrame") return false;

    // Validate tagged is a dictionary of string keys to Humanoid instances
    if (typeOf(tagged) !== "table") return false;
    for (const [key, value] of pairs(tagged)) {
        if (typeOf(key) !== "string") return false;
        if (!taggedValidator(value)) return false;
    }

    return true;
}