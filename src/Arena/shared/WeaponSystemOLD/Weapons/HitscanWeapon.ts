import { Workspace } from "@rbxts/services";
import { Weapon } from "./Weapon";
import { Players } from "@rbxts/services";
import { TracerPool } from "./TracerPool";
import { TweenService } from "@rbxts/services";
import FireTracer = require("Arena/shared/WeaponSystemOLD/Remotes/FireTracer");
import PlaySound = require("../Remotes/PlaySound");
import { DamageContext } from "Arena/shared/Damage/DamageService";
import { applyDamage } from "Arena/shared/Damage/DamageService";


export class HitscanWeapon extends Weapon {
    fire(origin: Vector3, direction: Vector3, weaponTool: Tool): DamageContext | undefined {
        if (this.currentAmmo <= 0) return undefined;
        this.currentAmmo--;

        const rayDirection = direction.Unit.mul(this.stats.range);
        const raycastParams = new RaycastParams();
        raycastParams.FilterDescendantsInstances = [];
        raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
        raycastParams.IgnoreWater = true;

        const player = Players.GetPlayerFromCharacter(this.owner);
        //if (!player) return;
        // if (player.Character) {
        //     raycastParams.FilterDescendantsInstances = [player.Character];
        // } else {
        raycastParams.FilterDescendantsInstances = [this.owner];
        // }

        const result = Workspace.Raycast(origin, rayDirection, raycastParams);
        visualizeRay(origin, rayDirection, result);
        const hitPosition = result ? result.Position : origin.add(rayDirection);

        // Tracer Logic
        // Need to Test!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        for (const otherPlayer of Players.GetPlayers()) {
            if (otherPlayer !== player) {
                FireTracer.FireClient(otherPlayer, origin, direction, weaponTool);
                PlaySound.FireClient(otherPlayer, "Fire", weaponTool);
            }
        }
        if (result) {
            const hit = result.Instance.FindFirstAncestorOfClass("Model");
            print(hit);
            const hitPlayer = Players.GetPlayerFromCharacter(hit);
            if (!hit) return undefined;

            const damageContext = {
                attacker: player,
                victimModel: hit,
                victimPlayer: hitPlayer,
                weaponId: "Placeholder",
                damageAmount: 25,
                hitPosition: result.Position,
                hitNormal: result.Normal,
                statusEffects: [],
            }
            applyDamage(damageContext); //For Testing
            return damageContext;
            //this.ammoType.effect?.apply(result.Instance);
            //print(`Hit ${result.Instance.Name} for ${this.stats.damage} damage`);
        }
        return undefined;


    }
}

function visualizeRay(origin: Vector3, direction: Vector3, result?: RaycastResult, duration = 2) {
    const hitPos = result ? result.Position : origin.add(direction);
    const distance = origin.sub(hitPos).Magnitude;

    const beam = new Instance("Part");
    beam.Size = new Vector3(.1, .1, distance);
    beam.Anchored = true;
    beam.CanCollide = false;
    beam.Material = Enum.Material.Neon;
    beam.BrickColor = new BrickColor("Bright red");
    beam.CFrame = CFrame.lookAt(origin, hitPos).mul(new CFrame(0, 0, -distance / 2));
    beam.Parent = Workspace;

    // Auto-cleanup
    game.GetService("Debris").AddItem(beam, duration);
}