import { WeaponStats } from "../Weapons/Weapon";
import { WeaponEffect } from "../WeaponEffects/WeaponEffect";

export interface AmmoType {
    name: string;
    modifiers: Partial<WeaponStats>;
    effect?: WeaponEffect;
}