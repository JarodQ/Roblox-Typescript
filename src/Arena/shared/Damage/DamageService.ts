import { StatusEffect } from "./StatusEffectRegistry";
import { ReplicatedStorage } from "@rbxts/services";
import { Players } from "@rbxts/services";

export interface DamageContext {
    attacker: Player | undefined;
    victimModel: Instance | undefined;
    victimPlayer: Player | undefined;
    weaponId: string;
    damageAmount: number;
    hitPosition: Vector3;
    hitNormal: Vector3;
    statusEffects: StatusEffect[];
}

export function defineContext(attacker: Instance, result: RaycastResult, damage: number): DamageContext {
    const playerAttacker = Players.GetPlayerFromCharacter(attacker);
    const hit = result.Instance.FindFirstAncestorOfClass("Model") as Instance;
    const hitPlayer = Players.GetPlayerFromCharacter(hit);
    const damageContext: DamageContext = {
        attacker: playerAttacker,
        victimModel: hit,
        victimPlayer: hitPlayer,
        weaponId: "",
        damageAmount: damage,
        hitPosition: result.Position,
        hitNormal: result.Normal,
        statusEffects: [],
    }
    return damageContext;
}

export function applyDamage(context: DamageContext) {
    if (context.victimModel === undefined) return;
    const humanoid = context.victimModel.FindFirstChildOfClass("Humanoid");
    if (!humanoid) return;
    print(`Hit player: ${context.victimPlayer}`)
    //humanoid.TakeDamage(context.damageAmount);
    // print(`Damage amount: ${context.damageAmount}`)
    humanoid.Health -= context.damageAmount;
    // print(`Players current health is: ${humanoid.Health} | Players max health is: ${humanoid.MaxHealth}`);

    for (const effect of context.statusEffects) {
        effect.apply(context.victimModel, context);
    }

    const damageEvent = ReplicatedStorage.WaitForChild("DamageEvents") as Folder;
    const toAttacker = damageEvent.WaitForChild("DamageConfirmed") as RemoteEvent;
    const toVictim = damageEvent.WaitForChild("DamageTaken") as RemoteEvent;

    // print(context.victimPlayer)
    if (context.attacker) toAttacker.FireClient(context.attacker, context);
    // if (context.victimPlayer) toVictim.FireClient(context.victimPlayer, context);

}