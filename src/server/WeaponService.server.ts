import FireWeapon = require("shared/WeaponSystem/Remotes/FireWeapon");
import ReloadWeapon = require("shared/WeaponSystem/Remotes/ReloadWeapon");
import { Weapon } from "shared/WeaponSystem/Weapons/Weapon";
import { createWeapon } from "shared/WeaponSystem/Weapons/WeaponFactory";

const playerWeapons = new Map<Player, Weapon>();

function isWeaponType(value: string): value is "hitscan" | "projectile" {
    return value === "hitscan" || value === "projectile";
}

FireWeapon.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
    const [origin, direction, weaponType, ammo] = args as [Vector3, Vector3, string, string];
    print("Attempting to fire weapon");
    let weapon = playerWeapons.get(player);
    const character = player.Character
    if (!weapon && character) {
        print("Past first check");

        if (isWeaponType(weaponType)) {
            print("Past second check. Going to fire!");

            weapon = createWeapon(character, weaponType, ammo);
            playerWeapons.set(player, weapon);
        } else {
            warn(`Invalid weapon type: ${weaponType}`);
            return;
        }
    }
    if (weapon) {
        print(`Weapon already exists! Firing!`);
        weapon.fire(origin, direction);
    }
});

ReloadWeapon.OnServerEvent.Connect((player: Player) => {
    const weapon = playerWeapons.get(player);
    if (weapon) weapon.reload();
})

