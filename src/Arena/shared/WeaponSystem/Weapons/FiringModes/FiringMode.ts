//import { Weapon } from "../Base/Weapon";

export interface FiringMode {
    startFiring(origin: Vector3, direction: Vector3): void
    stopFiring(): void;
}