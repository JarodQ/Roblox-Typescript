import { Workspace } from "@rbxts/services";
import { FiringMode } from "./FiringMode";

export class AutoFiring implements FiringMode {
    private fireCallback: (origin: Vector3, direction: Vector3) => void;
    private lastFireTime = 0;
    private isFiring = false;
    private fireRate: number;

    constructor(fireRate: number,
        fireCallback: (origin: Vector3, direction: Vector3) => void
    ) {
        this.fireRate = fireRate;
        this.fireCallback = fireCallback;
    }

    startFiring(origin: Vector3, direction: Vector3): void {
        if (this.isFiring) return;
        this.isFiring = true;

        task.spawn(() => {
            while (this.isFiring) {
                const now = Workspace.GetServerTimeNow();
                if (now - this.lastFireTime >= this.fireRate) {
                    this.lastFireTime = now;
                    this.fireCallback(origin, direction);
                }
                task.wait(0.01);
            }
        });
    }

    stopFiring(): void {
        // Stop auto-fire loop
        this.isFiring = false;
    }
}