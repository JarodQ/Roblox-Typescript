/**
 * Ensures the value is a real Roblox Instance and matches the expected class.
 *
 * Prevents spoofed tables from being passed as fake instances.
 */
export default function validateInstance(instance: unknown, expectedClass: keyof Instances): boolean {
    if (typeOf(instance) !== "Instance") {
        return false;
    }

    return (instance as Instance).IsA(expectedClass);
}
