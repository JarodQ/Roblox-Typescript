import { ServerScriptService } from "@rbxts/services";
import validateInstance from "Common/server/Utility/validateInstance";
import validateNumber from "Common/server/Utility/validateNumber";
import validateCFrame from "Common/server/Utility/validateCFrame";
import validateSimpleTable from "Common/server/Utility/validateSimpleTable";

function taggedValidator(instance: unknown): boolean {
    return validateInstance(instance, "Humanoid");
}

export default function validateShootArguments(
    timestamp: unknown,
    blaster: unknown,
    origin: unknown,
    tagged: unknown,
): boolean {
    if (!validateNumber(timestamp)) {
        return false;
    }
    if (!validateInstance(blaster, "Tool")) {
        return false;
    }
    if (!validateCFrame(origin)) {
        return false;
    }
    if (!validateSimpleTable(tagged, "string", taggedValidator)) {
        return false;
    }

    return true;
}
