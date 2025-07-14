import { WeaponEffect } from "./WeaponEffect";

export class ShockEffect implements WeaponEffect {
    name = "Shock";
    apply(target: Instance) {
        //stun/damage over time
    }
}

export class IceEffect implements WeaponEffect {
    name = "Ice";
    apply(target: Instance) {
        //slow/damage over time
    }
}