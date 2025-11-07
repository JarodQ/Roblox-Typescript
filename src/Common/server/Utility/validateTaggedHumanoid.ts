import validateInstance from "./validateInstance";

export function validateTaggedHumanoidTable(tbl: unknown): boolean {
    if (typeOf(tbl) !== "table") return false;

    for (const [key, value] of pairs(tbl as Record<string, unknown>)) {
        if (typeOf(key) !== "string") return false;
        if (typeOf(value) !== "table") return false;

        const entry = value as Partial<{ humanoid: unknown; isCritical: unknown }>;

        if (!validateInstance(entry.humanoid, "Humanoid")) return false;
        if (typeOf(entry.isCritical) !== "boolean") return false;
    }

    return true;
}
