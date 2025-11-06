import { Workspace } from "@rbxts/services";
import { Weapon } from "../Base/Weapon";
import { TraceStrategy } from "./TraceStrategy";
import { DamageContext } from "Arena/shared/Damage/DamageService";
import { Players } from "@rbxts/services";

export class HitscanTrace implements TraceStrategy {
    trace(origin: Vector3, direction: Vector3, owner: Instance, range: number): RaycastResult | undefined {
        const rayDirection = direction.Unit.mul(range);
        const raycastParams = new RaycastParams();
        raycastParams.FilterDescendantsInstances = [];
        raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
        raycastParams.IgnoreWater = true;

        const player = Players.GetPlayerFromCharacter(owner);
        //if (!player) return;
        // if (player.Character) {
        //     raycastParams.FilterDescendantsInstances = [player.Character];
        // } else {
        raycastParams.FilterDescendantsInstances = [owner];
        // }

        const result = Workspace.Raycast(origin, rayDirection, raycastParams);
        visualizeRay(origin, rayDirection, result);
        return result;
        //const hitPosition = result ? result.Position : origin.add(rayDirection);
    }
}

export class ProjectileTrace implements TraceStrategy {
    trace(origin: Vector3, direction: Vector3, owner: Instance, range: number): Instance | undefined {
        const part = new Instance("Part");
        part.Size = new Vector3(0.5, 0.5, 0.5);
        part.Position = origin;
        part.AssemblyLinearVelocity = direction.Unit.mul(100);
        part.Anchored = false;
        part.CanCollide = false;
        part.Parent = Workspace;

        part.Touched.Connect((hit) => {
            //this.ammoType.effect?.apply(hit);
            // print(`Projectile hit ${hit.Name}`);
            part.Destroy();
            return hit;
        });
        return;
    }
}

function visualizeRay(origin: Vector3, direction: Vector3, result?: RaycastResult, duration = 2) {
    const hitPos = result ? result.Position : origin.add(direction);
    const distance = origin.sub(hitPos).Magnitude;

    const beam = new Instance("Part");
    beam.Size = new Vector3(.1, .1, distance);
    beam.Anchored = true;
    beam.CanCollide = false;
    beam.CanQuery = false;
    beam.Material = Enum.Material.Neon;
    beam.BrickColor = new BrickColor("Bright red");
    beam.CFrame = CFrame.lookAt(origin, hitPos).mul(new CFrame(0, 0, -distance / 2));
    beam.Parent = Workspace;

    // Auto-cleanup
    game.GetService("Debris").AddItem(beam, duration);
}