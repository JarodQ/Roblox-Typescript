import { CollectionService, ReplicatedStorage, Workspace } from "@rbxts/services";
import Constants from "../Constants";
import { canPlayerDamageHumanoid } from "./canPlayerDamageHumanoid";

export interface RayResult {
    taggedHumanoid?: Humanoid;
    position: Vector3;
    normal: Vector3;
    instance?: Instance;
}

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
        for (const instance of nonStatic) {
            exclude.push(instance);
        }
    }

    if (player.Character) {
        exclude.push(player.Character);
    }

    let collisionGroup: string | undefined;
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
        const raycastResult = Workspace.Spherecast(position, radius, direction, params);

        const rayResult: RayResult = {
            position: position.add(direction),
            normal: direction.Unit,
        };

        if (raycastResult) {
            rayResult.position = raycastResult.Position;
            rayResult.normal = raycastResult.Normal;
            rayResult.instance = raycastResult.Instance;

            const humanoid = raycastResult.Instance.Parent?.FindFirstChildOfClass("Humanoid");
            if (humanoid && canPlayerDamageHumanoid(player, humanoid)) {
                rayResult.taggedHumanoid = humanoid;
            }
        }
        print(rayResult.taggedHumanoid)
        rayResults.push(rayResult);
        print("Printing rayresults: ", rayResults)
    }

    return rayResults;
}