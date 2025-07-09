import { ReplicatedStorage } from "@rbxts/services";
import { castRays, RayResult } from "shared/Weapon/Utility/castRays";
import { canPlayerDamageHumanoid } from "shared/Weapon/Utility/canPlayerDamageHumanoid";

const DIRECTION_BUFFER_CONSTANT = 10;
const WALL_DISTANCE_BUFFER_CONSTANT = 5;

/**
 * Validates whether a player is allowed to tag a humanoid based on raycast results.
 *
 * @param player - The player attempting to tag
 * @param taggedHumanoid - The humanoid being tagged
 * @param position - The origin of the ray
 * @param direction - The direction the ray was cast
 * @param rayResult - The result of the server-side raycast
 * @returns Whether the tag is valid
 */
export function validateTag(
    player: Player,
    taggedHumanoid: Humanoid,
    position: Vector3,
    direction: Vector3,
    rayResult: RayResult,
): boolean {
    // Check if the player is allowed to damage this humanoid
    if (!canPlayerDamageHumanoid(player, taggedHumanoid)) return false;

    const character = taggedHumanoid.FindFirstAncestorOfClass("Model");
    if (!character) return false;

    const pivot = character.GetPivot();
    const characterOffset = pivot.Position.sub(position);
    const characterDistance = characterOffset.Magnitude;
    const rayDistance = position.sub(rayResult.position).Magnitude;

    // Reject if the ray hit something before reaching the character
    if (rayDistance < characterDistance - WALL_DISTANCE_BUFFER_CONSTANT) return false;

    // Calculate the maximum allowable angle based on distance
    const maxAngle = math.atan(DIRECTION_BUFFER_CONSTANT / characterDistance);
    const angle = characterOffset.Angle(direction);

    if (angle > maxAngle) return false;

    return true;
}