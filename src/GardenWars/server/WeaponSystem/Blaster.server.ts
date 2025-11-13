import { Players, ReplicatedStorage, ServerScriptService } from "@rbxts/services";

import Constants from "GardenWars/shared/WeaponSystemV2/Weapon/Constants";
import validateInstance from "Common/server/Utility/validateInstance";
import validateShootArguments from "./validateShootArguments";
import validateShot from "./validateShot";
import validateTag from "./validateTag";
import validateReload from "./validateReload";
import { getRayDirections } from "GardenWars/shared/WeaponSystemV2/Utility/getRayDirection";
import { castRays, RayResult } from "GardenWars/shared/WeaponSystemV2/Utility/castRays";

const remotes = ReplicatedStorage.WaitForChild("Blaster").WaitForChild("Remotes");
const shootRemote = remotes.WaitForChild("Shoot") as RemoteEvent;
const reloadRemote = remotes.WaitForChild("Reload") as RemoteEvent;
const replicateShotRemote = remotes.WaitForChild("ReplicateShot") as RemoteEvent;

const events = ServerScriptService.WaitForChild("Blaster").WaitForChild("Events");
const taggedEvent = events.WaitForChild("Tagged") as BindableEvent;
const eliminatedEvent = events.WaitForChild("Eliminated") as BindableEvent;


function onShootEvent(player: Player, ...args: unknown[]) {
    const [timestamp, blaster, origin, tagged] = args as [
        number,
        Tool,
        CFrame,
        Map<string, { humanoid: Humanoid; isCritical: boolean }>
    ];
    // print("Validating shot")
    if (!validateShootArguments(timestamp, blaster, origin, tagged)) return;
    if (!validateShot(player, timestamp, blaster, origin)) return;
    // print("Shot validated")


    const spread = blaster.GetAttribute(Constants.SPREAD_ATTRIBUTE) as number;
    const raysPerShot = blaster.GetAttribute(Constants.RAYS_PER_SHOT_ATTRIBUTE) as number;
    const range = blaster.GetAttribute(Constants.RANGE_ATTRIBUTE) as number;
    const rayRadius = blaster.GetAttribute(Constants.RAY_RADIUS_ATTRIBUTE) as number;
    const normalDamage = blaster.GetAttribute(Constants.DAMAGE_ATTRIBUTE) as number;
    const criticalDamage = blaster.GetAttribute(Constants.CRITICAL_DAMAGE_ATTRIBUTE) as number;

    const ammo = blaster.GetAttribute(Constants.AMMO_ATTRIBUTE) as number;
    blaster.SetAttribute(Constants.AMMO_ATTRIBUTE, ammo - 1);

    const spreadAngle = math.rad(spread);
    const rayDirections = getRayDirections(origin, raysPerShot, spreadAngle, timestamp) as Vector3[];
    for (let i = 0; i < rayDirections.size(); i++) {
        rayDirections[i] = rayDirections[i].mul(range);
    }

    const rayResults = castRays(player, origin.Position, rayDirections, rayRadius, true);

    tagged.forEach(({ humanoid, isCritical }, indexStr) => {
        const index = tonumber(indexStr);
        if (index === undefined) return;

        const rayResult = rayResults[index - 1];
        const rayDirection = rayDirections[index - 1];
        if (!rayResult || !rayDirection) return;

        if (!validateTag(player, humanoid, origin.Position, rayDirection, rayResult)) return;
        (rayResult as RayResult).taggedHumanoid = humanoid;

        const model = humanoid.FindFirstAncestorOfClass("Model");
        if (model) {
            const modelPosition = model.GetPivot().Position;
            const distance = modelPosition.sub(origin.Position).Magnitude;
            rayResult.position = origin.Position.add(rayDirection.Unit.mul(distance));
        }

        if (humanoid.Health <= 0) return;
        // print("Applying damage")
        const damage = isCritical ? criticalDamage : normalDamage;
        humanoid.TakeDamage(damage);
        taggedEvent.Fire(player, humanoid, damage);

        if (humanoid.Health <= 0) {
            eliminatedEvent.Fire(player, humanoid, damage);
        }
    });

    const force = blaster.GetAttribute(Constants.UNANCHORED_IMPULSE_FORCE_ATTRIBUTE) as number;
    if (force !== 0) {
        for (let i = 0; i < rayResults.size(); i++) {
            const rayResult = rayResults[i];
            if ((rayResult as RayResult).taggedHumanoid) continue;

            if (rayResult.instance?.IsA("BasePart") && !rayResult.instance.Anchored) {
                const impulse = rayDirections[i].mul(force);
                rayResult.instance.ApplyImpulseAtPosition(impulse, rayResult.position);
            }
        }
    }

    for (const otherPlayer of Players.GetPlayers()) {
        if (otherPlayer === player) continue;
        replicateShotRemote.FireClient(otherPlayer, blaster, origin.Position, rayResults);
    }
}


function onReloadEvent(
    player: Player,
    ...args: unknown[]
) {
    const [blaster] = args as [Tool];

    if (!validateInstance(blaster, "Tool")) return;
    if (!validateReload(player, blaster)) return;
    const reloadTime = blaster.GetAttribute(Constants.RELOAD_TIME_ATTRIBUTE) as number;
    const magazineSize = blaster.GetAttribute(Constants.MAGAZINE_SIZE_ATTRIBUTE) as number;

    const character = player.Character;
    blaster.SetAttribute(Constants.RELOADING_ATTRIBUTE, true);

    let reloadTask: thread;
    let ancestryChangedConnection: RBXScriptConnection;

    reloadTask = task.delay(reloadTime, () => {
        blaster.SetAttribute(Constants.AMMO_ATTRIBUTE, magazineSize);
        blaster.SetAttribute(Constants.RELOADING_ATTRIBUTE, false);
        ancestryChangedConnection.Disconnect();
    });

    ancestryChangedConnection = blaster.AncestryChanged.Connect(() => {
        if (blaster.Parent !== character) {
            blaster.SetAttribute(Constants.RELOADING_ATTRIBUTE, false);
            task.cancel(reloadTask);
            ancestryChangedConnection.Disconnect();
        }
    });
}

function initialize() {
    shootRemote.OnServerEvent.Connect(onShootEvent);
    reloadRemote.OnServerEvent.Connect(onReloadEvent);
}

initialize();
