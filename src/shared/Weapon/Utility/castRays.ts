import { CollectionService, ReplicatedStorage, Workspace } from "@rbxts/services";
import { Constants } from "shared/Weapon/Constants";
import { canPlayerDamageHumanoid } from "./canPlayerDamageHumanoid";

export interface RayResult {
    taggedHumanoid?: Humanoid;
    position: Vector3;
    normal: Vector3;
    instance?: Instance;
}

/**
 * Casts a set of sphere rays from a position in given directions.
 * Applies filtering, optional static-only logic, and bullet magnetism.
 */
export function castRays(
    player: Player,
    position: Vector3,
    directions: Vector3[],
    radius: number,
    staticOnly?: boolean,
): RayResult[] {
    const exclude = CollectionService.GetTagged(Constants.RAY_EXCLUDE_TAG);

    if (staticOnly) {
        const nonStatic = CollectionService.GetTagged(Constants.NON_STATIC_TAG);
        for (const item of nonStatic) {
            exclude.push(item);
        }
    }

    if (player.Character) {
        exclude.push(player.Character);
    }

    let collisionGroup: string | undefined = undefined;
    if (player.Team && !player.Neutral) {
        collisionGroup = player.Team.Name;
    }

    const params = new RaycastParams();
    params.FilterType = Enum.RaycastFilterType.Exclude;
    params.IgnoreWater = true;
    params.FilterDescendantsInstances = exclude;
    if (collisionGroup) {
        params.CollisionGroup = collisionGroup;
    }

    const rayResults: RayResult[] = [];

    for (const direction of directions) {
        const result = Workspace.Spherecast(position, radius, direction, params);

        const rayResult: RayResult = {
            position: position.add(direction),
            normal: direction.Unit,
        };

        if (result) {
            rayResult.position = result.Position;
            rayResult.normal = result.Normal;
            rayResult.instance = result.Instance;

            const humanoid = result.Instance.FindFirstAncestorOfClass("Model")?.FindFirstChildOfClass("Humanoid");
            if (humanoid && canPlayerDamageHumanoid(player, humanoid)) {
                rayResult.taggedHumanoid = humanoid;
            }
        }

        rayResults.push(rayResult);
    }

    return rayResults;
}