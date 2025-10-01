import { applyDamage, DamageContext } from "Arena/shared/Damage/DamageService";

export interface BulletModifier {
    apply(context: DamageContext): void;
}


