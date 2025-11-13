import { ServerScriptService } from "@rbxts/services";
import validateInstance from "Common/server/Utility/validateInstance";
import validateNumber from "Common/server/Utility/validateNumber";
import validateCFrame from "Common/server/Utility/validateCFrame";
import validateSimpleTable from "Common/server/Utility/validateSimpleTable";
import { validateTaggedHumanoidTable } from "Common/server/Utility/validateTaggedHumanoid";

function taggedValidator(instance: unknown): boolean {
    return validateInstance(instance, "Humanoid");
}

export default function validateShootArguments(
    timestamp: unknown,
    blaster: unknown,
    origin: unknown,
    tagged: unknown,
): boolean {
    if (!validateNumber(timestamp)) return false;
    if (!validateInstance(blaster, "Tool")) return false;
    if (!validateCFrame(origin)) return false;

    if (typeOf(tagged) !== "table") return false;

    // Peek at the first value to determine structure
    for (const [, value] of pairs(tagged as Record<string, unknown>)) {
        if (typeOf(value) === "Instance") {
            // Simple table: Record<string, Humanoid>
            return validateSimpleTable(tagged, "string", taggedValidator);
        } else if (typeOf(value) === "table") {
            // Structured table: Record<string, { humanoid: Humanoid; isCritical: boolean }>
            return validateTaggedHumanoidTable(tagged);
        } else {
            return false;
        }
    }

    // If table is empty, accept it as valid
    return true;
}

