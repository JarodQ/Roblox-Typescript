import { ReplicatedStorage } from "@rbxts/services";

import { castRays, RayResult } from "Arena/shared/WeaponSystemV2/Utility/castRays";
import { canPlayerDamageHumanoid } from "Arena/shared/WeaponSystemV2/Utility/canPlayerDamageHumanoid";

const DIRECTION_BUFFER_CONSTANT = 10;
const WALL_DISTANCE_BUFFER_CONSTANT = 5;

export default function validateTag(
    player: Player,
    taggedHumanoid: Humanoid,
    position: Vector3,
    direction: Vector3,
    rayResult: RayResult,
): boolean {
    // Check team damage rules
    if (!canPlayerDamageHumanoid(player, taggedHumanoid)) {
        return false;
    }

    const character = taggedHumanoid.FindFirstAncestorOfClass("Model");
    if (!character) {
        return false;
    }

    const pivot = character.GetPivot();
    const characterOffset = pivot.Position.sub(position);
    const characterDistance = characterOffset.Magnitude;
    const rayDistance = position.sub(rayResult.position).Magnitude;

    // Reject if ray hits geometry before reaching the character
    if (rayDistance < characterDistance - WALL_DISTANCE_BUFFER_CONSTANT) {
        return false;
    }

    // Calculate max allowable angle based on distance
    const maxAngle = math.atan(DIRECTION_BUFFER_CONSTANT / characterDistance);
    const angle = characterOffset.Angle(direction);

    if (angle > maxAngle) {
        return false;
    }

    return true;
}
