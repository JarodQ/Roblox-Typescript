import { Players, ReplicatedStorage, ServerScriptService } from "@rbxts/services";
import { Constants } from "Arena/shared/Weapon/Constants";
import { validateShootArguments } from "Arena/server/Weapons/Validate/validateShootArguments";
import * as validateShot from "Arena/server/Weapons/Validate/validateShot";
import { validateTag } from "Arena/server/Weapons/Validate/validateTag";
import { validateReload } from "Arena/server/Weapons/Validate/validateReload";
import { getRayDirections } from "Arena/shared/Weapon/Utility/getRayDirections";
import { castRays, RayResult } from "Arena/shared/Weapon/Utility/castRays";

const remotes = ReplicatedStorage.WaitForChild("Blaster").WaitForChild("Remotes") as Folder;
const shootRemote = remotes.WaitForChild("Shoot") as RemoteEvent;
const reloadRemote = remotes.WaitForChild("Reload") as RemoteEvent;
const replicateShotRemote = remotes.WaitForChild("ReplicateShot") as RemoteEvent;

const events = ServerScriptService.WaitForChild("Blaster").WaitForChild("Events") as Folder;
const taggedEvent = events.WaitForChild("Tagged") as BindableEvent;
const eliminatedEvent = events.WaitForChild("Eliminated") as BindableEvent;

function onShootEvent(player: Player, ...args: unknown[]): void {
    if (
        args.size() !== 4 ||
        typeOf(args[0]) !== "number" ||
        !typeIs(args[1], "Instance") ||
        !args[1].IsA("Tool") ||
        typeOf(args[2]) !== "CFrame" ||
        typeOf(args[3]) !== "table"
    ) {
        return;
    }

    const [timestamp, blaster, origin, tagged] = args as [number, Tool, CFrame, Record<string, Humanoid>];

    if (!validateShootArguments(timestamp, blaster, origin, tagged)) return;

    const spread = blaster.GetAttribute(Constants.SPREAD_ATTRIBUTE) as number;
    const raysPerShot = blaster.GetAttribute(Constants.RAYS_PER_SHOT_ATTRIBUTE) as number;
    const range = blaster.GetAttribute(Constants.RANGE_ATTRIBUTE) as number;
    const rayRadius = blaster.GetAttribute(Constants.RAY_RADIUS_ATTRIBUTE) as number;
    const damage = blaster.GetAttribute(Constants.DAMAGE_ATTRIBUTE) as number;

    const ammo = blaster.GetAttribute(Constants.AMMO_ATTRIBUTE) as number;
    blaster.SetAttribute(Constants.AMMO_ATTRIBUTE, ammo - 1);

    const spreadAngle = math.rad(spread);
    const rayDirections = getRayDirections(origin, raysPerShot, spreadAngle, timestamp).map((dir) =>
        dir.mul(range),
    );

    const rayResults = castRays(player, origin.Position, rayDirections, rayRadius, true);

    for (const [indexString, taggedHumanoid] of pairs(tagged)) {
        const index = tonumber(indexString);
        if (!index) continue;

        const rayResult = rayResults[index];
        const rayDirection = rayDirections[index];
        if (!rayResult || !rayDirection) continue;

        if (!validateTag(player, taggedHumanoid, origin.Position, rayDirection, rayResult)) continue;

        rayResult.taggedHumanoid = taggedHumanoid;

        const model = taggedHumanoid.FindFirstAncestorOfClass("Model");
        if (model) {
            const modelPosition = model.GetPivot().Position;
            const distance = modelPosition.sub(origin.Position).Magnitude;
            rayResult.position = origin.Position.add(rayDirection.Unit.mul(distance));
        }

        if (taggedHumanoid.Health <= 0) continue;

        taggedHumanoid.TakeDamage(damage);
        taggedEvent.Fire(player, taggedHumanoid, damage);

        if (taggedHumanoid.Health <= 0) {
            eliminatedEvent.Fire(player, taggedHumanoid, damage);
        }
    }

    const force = blaster.GetAttribute(Constants.UNANCHORED_IMPULSE_FORCE_ATTRIBUTE) as number;
    if (force !== 0) {
        for (const [index, rayResult] of pairs(rayResults)) {
            if (rayResult.taggedHumanoid) continue;

            const instance = rayResult.instance;
            if (instance && instance.IsA("BasePart") && !instance.Anchored) {
                const direction = rayDirections[index];
                const impulse = direction.mul(force);
                instance.ApplyImpulseAtPosition(impulse, rayResult.position);
            }
        }
    }

    for (const otherPlayer of Players.GetPlayers()) {
        if (otherPlayer !== player) {
            replicateShotRemote.FireClient(otherPlayer, blaster, origin.Position, rayResults);
        }
    }
}

function onReloadEvent(player: Player, ...args: unknown[]): void {
    if (
        args.size() !== 1 ||
        !typeIs(args[0], "Instance") ||
        !args[0].IsA("Tool")
    ) {
        return;
    }

    const [blaster] = args as [Tool];

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

function initialize(): void {
    shootRemote.OnServerEvent.Connect(onShootEvent);
    reloadRemote.OnServerEvent.Connect(onReloadEvent);
}

initialize();