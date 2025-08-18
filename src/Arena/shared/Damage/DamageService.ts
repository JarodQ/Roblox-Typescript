import { StatusEffect } from "./StatusEffectRegistry";
import { ReplicatedStorage } from "@rbxts/services";

export interface DamageContext {
    attacker: Player;
    victimModel: Instance;
    victimPlayer: Player | undefined;
    weaponId: string;
    damageAmount: number;
    hitPosition: Vector3;
    hitNormal: Vector3;
    statusEffects: StatusEffect[];
}

export function applyDamage(context: DamageContext) {
    const humanoid = context.victimModel.FindFirstChildOfClass("Humanoid");
    if (!humanoid) return;

    humanoid.TakeDamage(context.damageAmount);

    for (const effect of context.statusEffects) {
        effect.apply(context.victimModel, context);
    }

    const damageEvent = ReplicatedStorage.WaitForChild("DamageEvents") as Folder;
    const toAttacker = damageEvent.WaitForChild("DamageConfirmed") as RemoteEvent;
    const toVictim = damageEvent.WaitForChild("DamageTaken") as RemoteEvent;

    toAttacker.FireClient(context.attacker, context);
    if (!context.victimPlayer) return;
    toVictim.FireClient(context.victimPlayer, context);
}