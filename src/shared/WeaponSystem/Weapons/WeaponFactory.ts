import { HitscanWeapon } from "./HitscanWeapon";
import { ProjectileWeapon } from "./ProjectileWeapon";
import { AmmoRegistry } from "../Ammo/AmmoRegistry";
import { Weapon } from "./Weapon";


export function createWeapon(owner: Instance, weaponType: "hitscan" | "projectile", ammoName: string): Weapon {

    const baseStats = {
        fireRate: 1,
        reloadSpeed: 2,
        damage: 10,
        range: 100,
    };

    const ammo = AmmoRegistry[ammoName];
    if (!ammo) error(`Unknown ammo type: ${ammoName}`);

    if (weaponType === "hitscan") {
        return new HitscanWeapon(owner, baseStats, ammo);
    } else {
        return new ProjectileWeapon(owner, baseStats, ammo);
    }
}