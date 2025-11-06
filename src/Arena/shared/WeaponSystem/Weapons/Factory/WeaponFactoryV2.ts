import { IWeapon } from "../Base/Weapon";
import { Weapon } from "../Base/Weapon";
import { WeaponStats } from "../Base/Weapon";
import { AmmoRegistry } from "../../Ammo/AmmoRegistry";
//import { HitscanWeapon } from "../TraceStrategy/HitscanWeapon";
//import { ProjectileWeapon } from "../TraceStrategy/ProjectileWeapon";
import { SemiAutoFiring } from "../FiringModes/SemiAutoFiring";
import { AutoFiring } from "../FiringModes/AutoFiring";
import { AmmoType } from "../../Ammo/AmmoType";
import { CarrotShooter } from "../Types/WeaponType/CarrotShooter";
import { BlueberryBlaster } from "../Types/WeaponType/BlueberryBlaster";
import { MaizeMauler } from "../Types/WeaponType/MaizeMauler";
import { HeliosLaser } from "../Types/WeaponType/HeliosLaser";
import { TraceStrategy } from "../TraceStrategy/TraceStrategy";


type WeaponConstructor = new (
    owner: Instance,
    tool: Tool,
) => Weapon;

const weaponRegistry: Record<string, WeaponConstructor> = {
    CarrotShooter_w: CarrotShooter,
    BlueberryBlaster_w: BlueberryBlaster,
    MaizeMauler_w: MaizeMauler,
    HeliosLaser_w: HeliosLaser,
}

export function createWeapon(
    weaponType: string,
    owner: Instance,
    tool: Tool
): Weapon {
    const WeaponClass = weaponRegistry[weaponType];
    if (!WeaponClass) {
        throw `Unknown weapon type: ${weaponType}`;
    }

    return new WeaponClass(owner, tool);
}