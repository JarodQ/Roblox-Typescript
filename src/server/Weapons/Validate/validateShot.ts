import { ServerScriptService } from "@rbxts/services";

/**
 * Validates that the given value is a Humanoid instance.
 */
function taggedValidator(instance: unknown): instance is Humanoid {
    return typeIs(instance, "Instance") && instance.IsA("Humanoid");
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
    player: Player,
    timestamp: number,
    blaster: Tool,
    origin: CFrame,
    tagged: Record<string, Humanoid>,
): boolean {
    // Check player is a Player
    if (!typeIs(player, "Instance") || !player.IsA("Player")) return false;

    // Check timestamp is a number
    if (typeOf(timestamp) !== "number") return false;

    // Check blaster is a Tool
    if (!typeIs(blaster, "Instance") || !blaster.IsA("Tool")) return false;

    // Check origin is a CFrame
    if (typeOf(origin) !== "CFrame") return false;

    // Check tagged is a dictionary of string keys to Humanoid instances
    if (typeOf(tagged) !== "table") return false;
    for (const [key, value] of pairs(tagged)) {
        if (typeOf(key) !== "string") return false;
        if (!typeIs(value, "Instance") || !value.IsA("Humanoid")) return false;
    }

    return true;
}