import { AmmoType } from "./AmmoType";
import { ShockEffect } from "../WeaponEffects/Effects";
import { IceEffect } from "../WeaponEffects/Effects";

export const AmmoRegistry: Record<string, AmmoType> = {
    Standard: {
        name: "Standard",
        modifiers: {},
    },
    Shock: {
        name: "Shock",
        modifiers: { damage: 5 },
        effect: new ShockEffect(),
    },
    Ice: {
        name: "Ice",
        modifiers: { fireRate: -0.2 },
        effect: new IceEffect(),
    },
}