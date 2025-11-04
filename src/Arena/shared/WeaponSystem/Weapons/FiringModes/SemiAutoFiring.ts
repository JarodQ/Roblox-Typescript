import { Workspace } from "@rbxts/services";
import { FiringMode } from "./FiringMode";
import { Weapon, WeaponStats } from "../Base/Weapon";
import { TraceStrategy } from "../TraceStrategy/TraceStrategy";
import { DamageContext } from "Arena/shared/Damage/DamageService";

export class SemiAutoFiring implements FiringMode {
    private fireCallback: (origin: Vector3, direction: Vector3) => void;
    private lastFireTime = 0;
    private fireRate: number;
    private isFiring: boolean;

    constructor(
        fireRate: number,
        fireCallback: (origin: Vector3, direction: Vector3) => void
    ) {
        this.fireRate = fireRate;
        this.fireCallback = fireCallback;
        this.isFiring = false;
    }

    startFiring(origin: Vector3, direction: Vector3): void {
        print("Firing in semiAuto")
        const now = Workspace.GetServerTimeNow();
        if (now - this.lastFireTime < this.fireRate) {
            // warn(`Semi-auto fire rate violation`);
            return;
        }
        this.lastFireTime = now;
        this.fireCallback(origin, direction);
        this.stopFiring();
    }

    stopFiring(): void {
        // No-op for semi-auto, but could be used for cooldowns or animation resets
    }
}