import { Workspace } from "@rbxts/services";
import FireWeapon = require("Arena/shared/WeaponSystem/Remotes/FireWeapon");
import StopFiring = require("Arena/shared/WeaponSystem/Remotes/StopFiring");
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
    let weapon = playerWeapons.get(player);

    const character = player.Character
    const weaponTool = character?.FindFirstChildOfClass("Tool");
    if (!weapon && character && weaponTool) {
        weapon = createWeapon(weaponTool.Name, character, weaponTool);
        playerWeapons.set(player, weapon);
    }
    if (weapon && weaponTool) {
        const damageContext = weapon.startFiring(origin, direction);
    }
});

StopFiring.OnServerEvent.Connect((player: Player) => {
    let weapon = playerWeapons.get(player);
    const character = player.Character
    const weaponTool = character?.FindFirstChildOfClass("Tool");
    if (weapon && weaponTool) {
        weapon.stopFiring();
    }
})

ReloadWeapon.OnServerEvent.Connect((player: Player) => {
    const weapon = playerWeapons.get(player);
    if (weapon) weapon.reload();
})

