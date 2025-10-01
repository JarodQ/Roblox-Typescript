import { Workspace } from "@rbxts/services";
import FireWeapon = require("Arena/shared/WeaponSystem/Remotes/FireWeapon");
import ReloadWeapon = require("Arena/shared/WeaponSystem/Remotes/ReloadWeapon");
import { Weapon } from "Arena/shared/WeaponSystem/Weapons/Base/Weapon";
import { createWeapon } from "Arena/shared/WeaponSystem/Weapons/Factory/WeaponFactoryV2";
import { applyDamage } from "Arena/shared/Damage/DamageService";

const playerWeapons = new Map<Player, Weapon>();
const lastFireTimestamps = new Map<Player, number>();
const FIRE_RATE = 0.2;
function isWeaponType(value: string): value is "hitscan" | "projectile" {
    return value === "hitscan" || value === "projectile";
}

FireWeapon.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
    const [origin, direction] = args as [Vector3, Vector3];

    // const now = Workspace.GetServerTimeNow();
    // const lastFire = lastFireTimestamps.get(player) ?? 0;
    // if (now - lastFire < FIRE_RATE - .05) {
    // warn(`Server Side Fire rate violation by ${player.Name}`);
    // return;
    // };

    // lastFireTimestamps.set(player, now);
    let weapon = playerWeapons.get(player);
    const character = player.Character
    const weaponTool = character?.FindFirstChildOfClass("Tool");
    //print(character, weaponTool);
    if (!weapon && character && weaponTool) {
        // print("Past first check");

        //print("Past second check. Going to fire!");

        weapon = createWeapon(weaponTool.Name, character, weaponTool);
        //print(weapon);

        playerWeapons.set(player, weapon);

    }
    if (weapon && weaponTool) {

        //print(`Weapon already exists! Firing!`);
        const damageContext = weapon.startFiring(origin, direction);
        //weapon.playFireSound("Fire");
    }

});

ReloadWeapon.OnServerEvent.Connect((player: Player) => {
    const weapon = playerWeapons.get(player);
    if (weapon) weapon.reload();
})

