import { Weapon } from "../Base/Weapon";
import { DamageContext } from "Arena/shared/Damage/DamageService";

export interface TraceStrategy {
    trace(origin: Vector3, direction: Vector3, owner: Instance, range: number): RaycastResult | Instance | undefined;
}