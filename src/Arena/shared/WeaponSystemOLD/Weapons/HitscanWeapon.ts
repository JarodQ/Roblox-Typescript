import { Workspace } from "@rbxts/services";
import { Weapon } from "./Weapon";
import { Players } from "@rbxts/services";
import { TracerPool } from "./TracerPool";
import { TweenService } from "@rbxts/services";
import FireTracer = require("Arena/shared/WeaponSystemOLD/Remotes/FireTracer");
import PlaySound = require("../Remotes/PlaySound");
import { DamageContext } from "Arena/shared/Damage/DamageService";


export class HitscanWeapon extends Weapon {
    fire(origin: Vector3, direction: Vector3, weaponTool: Tool): DamageContext | undefined {
        if (this.currentAmmo <= 0) return undefined;
        this.currentAmmo--;

        //print("Firing Hitscan");

        const rayDirection = direction.Unit.mul(this.stats.range);

        const raycastParams = new RaycastParams();
        raycastParams.FilterDescendantsInstances = [];
        raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
        raycastParams.IgnoreWater = true;

        const player = Players.GetPlayerFromCharacter(this.owner);
        if (!player) return;
        if (player.Character) {
            raycastParams.FilterDescendantsInstances = [player.Character];
        } else {
            raycastParams.FilterDescendantsInstances = [];
        }

        const result = Workspace.Raycast(origin, rayDirection, raycastParams);

        const hitPosition = result ? result.Position : origin.add(rayDirection);

        //Tracer Logic
        // Need to Test!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        for (const otherPlayer of Players.GetPlayers()) {
            if (otherPlayer !== player) {
                FireTracer.FireClient(otherPlayer, origin, direction, weaponTool);
                PlaySound.FireClient(otherPlayer, "Fire", this.tool);
            }
        }
        if (result) {
            const hit = result.Instance.FindFirstAncestorOfClass("Model");
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
            return damageContext;
            //this.ammoType.effect?.apply(result.Instance);
            //print(`Hit ${result.Instance.Name} for ${this.stats.damage} damage`);
        }
        return undefined;


    }
}
