import { Workspace } from "@rbxts/services";
import FireWeapon = require("shared/WeaponSystemOLD/Remotes/FireWeapon");
import ReloadWeapon = require("shared/WeaponSystemOLD/Remotes/ReloadWeapon");
import { Weapon } from "shared/WeaponSystemOLD/Weapons/Weapon";
import { createWeapon } from "shared/WeaponSystemOLD/Weapons/WeaponFactory";

const playerWeapons = new Map<Player, Weapon>();
const lastFireTimestamps = new Map<Player, number>();
const FIRE_RATE = 0.5;
function isWeaponType(value: string): value is "hitscan" | "projectile" {
    return value === "hitscan" || value === "projectile";
}

FireWeapon.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
    const [origin, direction, weaponType, ammo] = args as [Vector3, Vector3, string, string];

    const now = Workspace.GetServerTimeNow();
    const lastFire = lastFireTimestamps.get(player) ?? 0;
    if (now - lastFire < FIRE_RATE) {
        warn(`Fire rate violation by ${player.Name}`);
        return;
    };

    lastFireTimestamps.set(player, now);

    let weapon = playerWeapons.get(player);
    const character = player.Character
    const weaponTool = character?.FindFirstChildOfClass("Tool");
    print(character, weaponTool);
    if (!weapon && character && weaponTool) {
        print("Past first check");

        if (isWeaponType(weaponType)) {
            print("Past second check. Going to fire!");

            weapon = createWeapon(character, weaponType, ammo, weaponTool);
            print(weapon);

            playerWeapons.set(player, weapon);
        } else {
            warn(`Invalid weapon type: ${weaponType}`);
            return;
        }
    }
    if (weapon && weaponTool) {
        print(`Weapon already exists! Firing!`);
        weapon.fire(origin, direction, weaponTool);
    }
});

ReloadWeapon.OnServerEvent.Connect((player: Player) => {
    const weapon = playerWeapons.get(player);
    if (weapon) weapon.reload();
})

