import { Weapon } from "../../Base/Weapon";
import { SemiAutoFiring } from "../../FiringModes/SemiAutoFiring";
import { AmmoType } from "Arena/shared/WeaponSystem/Ammo/AmmoType";
import { TraceStrategy } from "../../TraceStrategy/TraceStrategy";
import { WeaponStats } from "../../Base/Weapon";
import { HitscanTrace } from "../../TraceStrategy/Traces";
import { weaponStatsConfig } from "../../Stats/WeaponStats";
import { AutoFiring } from "../../FiringModes/AutoFiring";
import { DamageContext, defineContext, applyDamage } from "Arena/shared/Damage/DamageService";

export class HeliosLaser extends Weapon {
    private traceStrategy: TraceStrategy;

    constructor(owner: Instance, tool: Tool) {
        const weaponStats = weaponStatsConfig["CarrotShooter"];
        super(owner, weaponStats, tool);

        this.traceStrategy = new HitscanTrace();

        this.firingMode = new SemiAutoFiring(
            this.stats.fireRate,
            (origin, direction) => {

                const result = this.traceStrategy.trace(origin, direction, this.owner, this.stats.range);
                if (!result) return;
                const context = defineContext(this.owner, result as RaycastResult, this.stats.damage)
                // print(context);
                applyDamage(context);
                this.playFireSound("Fire");
            }
        );
    }
}