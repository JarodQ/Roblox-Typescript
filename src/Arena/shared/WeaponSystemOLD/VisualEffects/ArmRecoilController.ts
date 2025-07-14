// ArmRecoilController.ts
import { RunService } from "@rbxts/services";

export class ArmRecoilController {
    private motor: Motor6D;
    private defaultC0: CFrame;
    private targetOffset: CFrame;
    private recoilStrength = math.rad(-10);
    private recoilSpeed = 30;
    private recoverSpeed = 10;

    private recoilProgress = 0;
    private recoverProgress = 0;
    private state: "idle" | "recoiling" | "recovering" = "idle";

    constructor(motor: Motor6D) {
        this.motor = motor;
        this.defaultC0 = motor.C0;
        this.targetOffset = CFrame.Angles(-this.recoilStrength, 0, 0);

        RunService.RenderStepped.Connect((dt) => this.step(dt));
    }

    public triggerRecoil() {
        this.recoilProgress = 0;
        this.recoverProgress = 0;
        this.state = "recoiling";
    }

    private step(dt: number) {
        if (this.state === "recoiling") {
            this.recoilProgress = math.min(this.recoilProgress + dt * this.recoilSpeed, 1);
            const recoilC0 = this.defaultC0.Lerp(this.defaultC0.mul(this.targetOffset), this.recoilProgress);
            this.motor.C0 = recoilC0;

            if (this.recoilProgress >= 1) {
                this.state = "recovering";
            }
        } else if (this.state === "recovering") {
            this.recoverProgress = math.min(this.recoverProgress + dt * this.recoverSpeed, 1);
            const recoverC0 = this.defaultC0.mul(this.targetOffset).Lerp(this.defaultC0, this.recoverProgress);
            this.motor.C0 = recoverC0;

            if (this.recoverProgress >= 1) {
                this.state = "idle";
            }
        }
    }
}