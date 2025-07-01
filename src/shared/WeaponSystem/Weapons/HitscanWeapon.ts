import { Workspace } from "@rbxts/services";
import { Weapon } from "./Weapon";
import { Players } from "@rbxts/services";

export class HitscanWeapon extends Weapon {
    fire(origin: Vector3, direction: Vector3) {
        if (this.currentAmmo <= 0) return;
        this.currentAmmo--;
        print("Firing Weapon");
        const rayDirection = direction.Unit.mul(this.stats.range);

        const raycastParams = new RaycastParams();
        raycastParams.FilterDescendantsInstances = [];
        raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
        raycastParams.IgnoreWater = true;

        const player = Players.GetPlayerFromCharacter(this.owner);
        if (player && player.Character) {
            raycastParams.FilterDescendantsInstances = [player.Character];
        } else {
            raycastParams.FilterDescendantsInstances = [];
        }

        const result = Workspace.Raycast(origin, rayDirection, raycastParams);
        if (result && result.Instance) {
            this.ammoType.effect?.apply(result.Instance);
            print(`Hit ${result.Instance.Name} for ${this.stats.damage} damage`);
        }
    }
}