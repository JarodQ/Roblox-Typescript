import { WeaponStats } from "../Weapons/Weapon";
import { WeaponEffect } from "../Effects/WeaponEffect";

export interface AmmoType {
    name: string;
    modifiers: Partial<WeaponStats>;
    effect?: WeaponEffect;
}