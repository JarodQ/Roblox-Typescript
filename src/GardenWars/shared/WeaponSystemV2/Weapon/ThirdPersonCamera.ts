// import { Players, RunService, UserInputService, Workspace } from "@rbxts/services";

// type CameraSettings = {
//     minPitch: number;
//     maxPitch: number;
//     minDistance: number;
//     maxDistance: number;
//     defaultDistance: number;
//     shoulderOffset: Vector3;
//     heightOffset: number;
//     sensitivity: Vector2;
//     collisionRadius: number;
//     zoomStep: number;
//     smoothing: number;
//     recoilDamping: number;
// };

// const DEFAULT_SETTINGS: CameraSettings = {
//     minPitch: math.rad(-60),
//     maxPitch: math.rad(70),
//     minDistance: 4,
//     maxDistance: 16,
//     defaultDistance: 10,
//     shoulderOffset: new Vector3(2.2, 1.8, 0),
//     heightOffset: 2.2,
//     sensitivity: new Vector2(0.01, 0.01),
//     collisionRadius: 0.5,
//     zoomStep: 1,
//     smoothing: 0.25,
//     recoilDamping: 12, // faster recovery
// };

// class ThirdPersonCameraController {
//     private player = Players.LocalPlayer;
//     private camera = Workspace.CurrentCamera!;
//     private humanoid?: Humanoid;
//     private hrp?: BasePart;

//     private enabled = false;
//     private yaw = 0;
//     private pitch = 0;
//     private targetDistance: number;
//     private currentDistance: number;
//     private shoulder = 1;

//     private recoilYaw = 0;
//     private recoilPitch = 0;

//     private transitioning = false;
//     private transitionAlpha = 0;

//     private cons: RBXScriptConnection[] = [];

//     constructor(private settings: CameraSettings = DEFAULT_SETTINGS) {
//         this.targetDistance = settings.defaultDistance;
//         this.currentDistance = settings.defaultDistance;
//     }

//     enable() {
//         if (this.enabled) return;
//         this.enabled = true;

//         const char = this.player.Character ?? this.player.CharacterAdded.Wait()[0];
//         this.humanoid = char.FindFirstChildOfClass("Humanoid") as Humanoid | undefined;
//         this.hrp = char.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
//         if (!this.humanoid || !this.hrp) return;

//         this.humanoid.AutoRotate = false;

//         // Initialize yaw from facing
//         const look = this.hrp.CFrame.LookVector;
//         this.yaw = math.atan2(look.X, look.Z);
//         this.pitch = 0;

//         this.camera.CameraType = Enum.CameraType.Scriptable;
//         UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
//         UserInputService.MouseIconEnabled = false;

//         this.transitioning = true;
//         this.transitionAlpha = 0;

//         this.cons.push(
//             UserInputService.InputBegan.Connect((input, processed) => {
//                 if (processed) return;
//                 if (input.KeyCode === Enum.KeyCode.Q) this.shoulder = -this.shoulder;
//                 else if (input.UserInputType === Enum.UserInputType.MouseWheel) {
//                     const delta = math.sign(input.Position.Z) * this.settings.zoomStep;
//                     this.targetDistance = math.clamp(
//                         this.targetDistance - delta,
//                         this.settings.minDistance,
//                         this.settings.maxDistance,
//                     );
//                 }
//             }),
//         );

//         RunService.BindToRenderStep("ThirdPersonCamera", Enum.RenderPriority.Camera.Value + 1, (dt) => this.onStep(dt));
//     }

//     disable() {
//         if (!this.enabled) return;
//         this.enabled = false;

//         RunService.UnbindFromRenderStep("ThirdPersonCamera");
//         this.cons.forEach((c) => c.Disconnect());
//         this.cons = [];

//         if (this.humanoid) this.humanoid.AutoRotate = true;
//         this.camera.CameraType = Enum.CameraType.Custom;
//         UserInputService.MouseBehavior = Enum.MouseBehavior.Default;
//         UserInputService.MouseIconEnabled = true;
//     }

//     addRecoil(kick: Vector2) {
//         // Scale down kick strength and smooth it
//         const scaledYaw = kick.X * 0.4;
//         const scaledPitch = kick.Y * 0.4;

//         this.recoilYaw = this.lerp(this.recoilYaw, this.recoilYaw + scaledYaw, 0.3);
//         this.recoilPitch = this.lerp(this.recoilPitch, this.recoilPitch + scaledPitch, 0.3);

//         this.recoilPitch = math.clamp(this.recoilPitch, this.settings.minPitch, this.settings.maxPitch);
//     }

//     private onStep(dt: number) {
//         if (!this.hrp || !this.humanoid) return;

//         // Always capture mouse delta
//         const delta = UserInputService.GetMouseDelta();
//         const dx = delta.X * this.settings.sensitivity.X;
//         const dy = delta.Y * this.settings.sensitivity.Y;

//         // Flip yaw so left = left
//         this.yaw -= dx;
//         this.pitch = math.clamp(this.pitch - dy, this.settings.minPitch, this.settings.maxPitch);

//         // Decay recoil
//         const decay = math.clamp(this.settings.recoilDamping * dt, 0, 1);
//         this.recoilYaw *= 1 - decay;
//         this.recoilPitch *= 1 - decay;

//         // Smooth distance
//         this.currentDistance = this.lerp(this.currentDistance, this.targetDistance, math.min(1, this.settings.smoothing));

//         // Apply orbit + recoil
//         const yawTotal = this.yaw + this.recoilYaw;
//         const pitchTotal = math.clamp(this.pitch + this.recoilPitch, this.settings.minPitch, this.settings.maxPitch);

//         const rot = CFrame.Angles(0, yawTotal, 0).mul(CFrame.Angles(pitchTotal, 0, 0));
//         const forward = rot.LookVector;

//         const shoulderLocal = new Vector3(this.settings.shoulderOffset.X * this.shoulder, this.settings.shoulderOffset.Y, 0);
//         const shoulderWorld = rot.mul(new CFrame(shoulderLocal)).Position;

//         const origin = this.hrp.Position.add(new Vector3(0, this.settings.heightOffset, 0)).add(shoulderWorld);
//         const desiredCameraPos = origin.sub(forward.mul(this.currentDistance));
//         const safePos = this.resolveCollision(origin, desiredCameraPos, this.settings.collisionRadius);

//         const desiredCFrame = CFrame.lookAt(safePos, safePos.add(forward));

//         if (this.transitioning) {
//             this.transitionAlpha = math.min(this.transitionAlpha + dt * 3, 1); // ~0.33s transition
//             this.camera.CFrame = this.camera.CFrame.Lerp(desiredCFrame, this.transitionAlpha);
//             if (this.transitionAlpha >= 1) this.transitioning = false;
//         } else {
//             this.camera.CFrame = desiredCFrame;
//         }

//         // Align character yaw to camera yaw
//         const rootPos = this.hrp.Position;
//         const face = new CFrame(rootPos).mul(CFrame.Angles(0, yawTotal, 0));
//         this.hrp.CFrame = new CFrame(rootPos, rootPos.add(face.LookVector));
//     }

//     private resolveCollision(origin: Vector3, desired: Vector3, radius: number): Vector3 {
//         const dir = desired.sub(origin);
//         if (dir.Magnitude <= 1e-4) return desired;

//         const params = new RaycastParams();
//         params.FilterDescendantsInstances = [this.player.Character!];
//         params.FilterType = Enum.RaycastFilterType.Blacklist;

//         const result = Workspace.Raycast(origin, dir, params);
//         if (!result) return desired;

//         const pullBack = math.max(0.2, radius);
//         return result.Position.sub(dir.Unit.mul(pullBack));
//     }

//     private lerp(a: number, b: number, t: number) {
//         return a + (b - a) * t;
//     }
// }

// export default ThirdPersonCameraController;


import { Players, RunService, UserInputService, Workspace } from "@rbxts/services";

type CameraSettings = {
    minPitch: number;
    maxPitch: number;
    minDistance: number;
    maxDistance: number;
    defaultDistance: number;
    shoulderOffset: Vector3;
    heightOffset: number;
    sensitivity: Vector2;
    collisionRadius: number;
    zoomStep: number;
    smoothing: number;
    recoilDamping: number;
};

const DEFAULT_SETTINGS: CameraSettings = {
    minPitch: math.rad(-60),
    maxPitch: math.rad(70),
    minDistance: 4,
    maxDistance: 16,
    defaultDistance: 10,
    shoulderOffset: new Vector3(2.2, 1.8, 0),
    heightOffset: 2.2,
    sensitivity: new Vector2(0.01, 0.01),
    collisionRadius: 0.5,
    zoomStep: 1,
    smoothing: 0.25,
    recoilDamping: 12, // faster recovery
};

class ThirdPersonCameraController {
    private player = Players.LocalPlayer;
    private camera = Workspace.CurrentCamera!;
    private humanoid?: Humanoid;
    private hrp?: BasePart;

    private enabled = false;
    private yaw = 0;
    private pitch = 0;
    private targetDistance: number;
    private currentDistance: number;
    private shoulder = 1;

    private recoilYaw = 0;
    private recoilPitch = 0;

    private transitioning = false;
    private transitionAlpha = 0;

    private cons: RBXScriptConnection[] = [];

    constructor(private settings: CameraSettings = DEFAULT_SETTINGS) {
        this.targetDistance = settings.defaultDistance;
        this.currentDistance = settings.defaultDistance;
    }

    enable() {
        if (this.enabled) return;
        this.enabled = true;

        const char = this.player.Character ?? this.player.CharacterAdded.Wait()[0];
        this.humanoid = char.FindFirstChildOfClass("Humanoid") as Humanoid | undefined;
        this.hrp = char.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
        if (!this.humanoid || !this.hrp) return;

        this.humanoid.AutoRotate = false;

        // ✅ Initialize yaw directly from HRP orientation
        const [_, y, __] = this.hrp.CFrame.ToOrientation();
        this.yaw = y;
        this.pitch = 0;

        this.camera.CameraType = Enum.CameraType.Scriptable;
        UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
        UserInputService.MouseIconEnabled = false;

        // Smooth transition flag
        this.transitioning = true;
        this.transitionAlpha = 0;

        this.cons.push(
            UserInputService.InputBegan.Connect((input, processed) => {
                if (processed) return;
                if (input.KeyCode === Enum.KeyCode.Q) this.shoulder = -this.shoulder;
                else if (input.UserInputType === Enum.UserInputType.MouseWheel) {
                    const delta = math.sign(input.Position.Z) * this.settings.zoomStep;
                    this.targetDistance = math.clamp(
                        this.targetDistance - delta,
                        this.settings.minDistance,
                        this.settings.maxDistance,
                    );
                }
            }),
        );

        RunService.BindToRenderStep("ThirdPersonCamera", Enum.RenderPriority.Camera.Value + 1, (dt) => this.onStep(dt));
    }


    disable() {
        if (!this.enabled) return;
        this.enabled = false;

        RunService.UnbindFromRenderStep("ThirdPersonCamera");
        this.cons.forEach((c) => c.Disconnect());
        this.cons = [];

        if (this.humanoid) this.humanoid.AutoRotate = true;
        this.camera.CameraType = Enum.CameraType.Custom;
        UserInputService.MouseBehavior = Enum.MouseBehavior.Default;
        UserInputService.MouseIconEnabled = true;
    }

    addRecoil(kick: Vector2) {
        // Scale down kick strength and smooth it
        const scaledYaw = kick.X * 0.4;
        const scaledPitch = kick.Y * 0.4;

        this.recoilYaw = this.lerp(this.recoilYaw, this.recoilYaw + scaledYaw, 0.3);
        this.recoilPitch = this.lerp(this.recoilPitch, this.recoilPitch + scaledPitch, 0.3);

        this.recoilPitch = math.clamp(this.recoilPitch, this.settings.minPitch, this.settings.maxPitch);
    }

    private onStep(dt: number) {
        if (!this.hrp || !this.humanoid) return;

        // Always capture mouse delta
        const delta = UserInputService.GetMouseDelta();
        const dx = delta.X * this.settings.sensitivity.X;
        const dy = delta.Y * this.settings.sensitivity.Y;

        // ✅ Flip yaw so left = left
        this.yaw -= dx;
        this.pitch = math.clamp(this.pitch - dy, this.settings.minPitch, this.settings.maxPitch);

        // Decay recoil
        const decay = math.clamp(this.settings.recoilDamping * dt, 0, 1);
        this.recoilYaw *= 1 - decay;
        this.recoilPitch *= 1 - decay;

        // Smooth distance
        this.currentDistance = this.lerp(this.currentDistance, this.targetDistance, math.min(1, this.settings.smoothing));

        // Apply orbit + recoil
        const yawTotal = this.yaw + this.recoilYaw;
        const pitchTotal = math.clamp(this.pitch + this.recoilPitch, this.settings.minPitch, this.settings.maxPitch);

        const rot = CFrame.Angles(0, yawTotal, 0).mul(CFrame.Angles(pitchTotal, 0, 0));
        const forward = rot.LookVector;

        const shoulderLocal = new Vector3(this.settings.shoulderOffset.X * this.shoulder, this.settings.shoulderOffset.Y, 0);
        const shoulderWorld = rot.mul(new CFrame(shoulderLocal)).Position;

        const origin = this.hrp.Position.add(new Vector3(0, this.settings.heightOffset, 0)).add(shoulderWorld);
        const desiredCameraPos = origin.sub(forward.mul(this.currentDistance));
        const safePos = this.resolveCollision(origin, desiredCameraPos, this.settings.collisionRadius);

        const desiredCFrame = CFrame.lookAt(safePos, safePos.add(forward));

        // ✅ Smooth transition into locked state
        if (this.transitioning) {
            this.transitionAlpha = math.min(this.transitionAlpha + dt * 3, 1); // ~0.33s transition
            this.camera.CFrame = this.camera.CFrame.Lerp(desiredCFrame, this.transitionAlpha);
            if (this.transitionAlpha >= 1) this.transitioning = false;
        } else {
            this.camera.CFrame = desiredCFrame;
        }

        // Align character yaw to camera yaw
        const rootPos = this.hrp.Position;
        const face = new CFrame(rootPos).mul(CFrame.Angles(0, yawTotal, 0));
        this.hrp.CFrame = new CFrame(rootPos, rootPos.add(face.LookVector));
    }


    private resolveCollision(origin: Vector3, desired: Vector3, radius: number): Vector3 {
        const dir = desired.sub(origin);
        if (dir.Magnitude <= 1e-4) return desired;

        const params = new RaycastParams();
        params.FilterDescendantsInstances = [this.player.Character!];
        params.FilterType = Enum.RaycastFilterType.Blacklist;

        const result = Workspace.Raycast(origin, dir, params);
        if (!result) return desired;

        const pullBack = math.max(0.2, radius);
        return result.Position.sub(dir.Unit.mul(pullBack));
    }

    private lerp(a: number, b: number, t: number) {
        return a + (b - a) * t;
    }
}

export default ThirdPersonCameraController;


