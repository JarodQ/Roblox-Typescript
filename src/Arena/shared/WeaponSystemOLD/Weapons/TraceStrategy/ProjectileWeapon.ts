throw "This module is disabled temporarily";

import { Workspace } from "@rbxts/services";
import { Weapon } from "../Base/Weapon";
import { DamageContext } from "Arena/shared/Damage/DamageService";

// export class ProjectileWeapon extends Weapon {
//     fire(origin: Vector3, direction: Vector3, weaponTool: Tool): DamageContext | undefined {
//         if (this.currentAmmo <= 0) return;
//         this.currentAmmo--;

//         const part = new Instance("Part");
//         part.Size = new Vector3(0.5, 0.5, 0.5);
//         part.Position = origin;
//         part.AssemblyLinearVelocity = direction.Unit.mul(100);
//         part.Anchored = false;
//         part.CanCollide = false;
//         part.Parent = Workspace;

//         part.Touched.Connect((hit) => {
//             this.ammoType.effect?.apply(hit);
//             print(`Projectile hit ${hit.Name} for ${this.stats.damage} damage`);
//             part.Destroy();
//         });
//     }
// }