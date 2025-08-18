import { DamageContext } from "./DamageService";

export interface StatusEffect {
    name: string;
    apply: (target: Instance, context: DamageContext) => void;
    duration?: number;
}

const registry: Record<string, StatusEffect> = {};

export function registerEffect(effect: StatusEffect) {
    registry[effect.name] = effect;
}

export function getEffect(name: string): StatusEffect | undefined {
    return registry[name];
}