import { WeaponConfig } from "shared/types/WeaponTypes";
import { playLaserBeamEffect } from "shared/Weapon/Effects/LaserBeamEffect";
import { playImpactEffect } from "shared/Weapon/Effects/ImpactEffect";
import { castRays } from "shared/Weapon/Utility/castRays";

/* export const AutoBlasterConfig: WeaponConfig = {
    name: "AutoBlaster",
    fireRate: 0.1,
    ammoCapacity: 30,
    reloadTime: 2,
    isAutomatic: true,
    viewModelName: "AutoBlaster",
    effects: {
        beamEffect: playLaserBeamEffect,
        impactEffect: playImpactEffect,
    },
    fireFunction: (origin, direction, player) => {
        const result = castRays(origin, direction);
        if (result) {
            print(`Hit ${result.Instance.Name}`);
        }
    },
};
 */
/* export const AutoBlasterConfig: WeaponConfig = {
    name: "AutoBlaster",
    fireRate: 0.1,
    ammoCapacity: 30,
    reloadTime: 2,
    isAutomatic: true,
    viewModelName: "AutoBlaster",
    effects: {
        beamEffect: playLaserBeamEffect,
        impactEffect: playImpactEffect,
    },
    fireFunction: (origin, direction, player) => {
        const rayDirections = [direction.Unit.mul(Constants.RANGE_ATTRIBUTE as number)];
        const rayRadius = Constants.RAY_RADIUS_ATTRIBUTE as number;

        const rayResults = castRays(player, origin, rayDirections, rayRadius);

        for (const result of rayResults) {
            if (result.instance) {
                print(`Hit ${result.instance.Name}`);

                // Play beam and impact effects if defined
                AutoBlasterConfig.effects.beamEffect?.(origin, direction);
                AutoBlasterConfig.effects.impactEffect?.(
                    result.position,
                    result.normal,
                    result.taggedHumanoid !== undefined,
                );
            }
        }
    },
}; */