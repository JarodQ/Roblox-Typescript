// import { Players, ReplicatedStorage, UserInputService, Workspace } from "@rbxts/services";
// import Constants from "./Constants";
// import AimAssist from "./AimAssist/AimAssistController";
// import AimAssistEnum from "./AimAssist/AimAssistEnum";
// import TouchInputController from "./TouchInputcontroller";
// import CameraRecoiler from "./CameraRecoiler";
// // import ViewModelController from "./ViewModelController";
// import CharacterAnimationController from "./CharacterAnimationController";
// import GuiController from "./GuiController";
// import disconnectAndClear from "Common/shared/Utility/disconnectAndClear";
// import { getRayDirections } from "../Utility/getRayDirection";
// import { drawRayResults } from "../Utility/drawRayResults";
// import { castRays } from "../Utility/castRays";

// import { ContextActionService } from "@rbxts/services";
// import ThirdPersonCameraController from "./ThirdPersonCamera";

// const player = Players.LocalPlayer;
// const camera = Workspace.CurrentCamera!;
// const remotes = ReplicatedStorage.WaitForChild("Blaster").WaitForChild("Remotes") as Folder;
// const shootRemote = remotes.WaitForChild("Shoot") as RemoteEvent;
// const reloadRemote = remotes.WaitForChild("Reload") as RemoteEvent;

// const random = new Random();

// export class BlasterController {
//     private blaster: Tool;
//     private muzzle: Attachment;
//     private aimAssistController: AimAssist;
//     // private viewModelController: ViewModelController;
//     private guiController: GuiController;
//     private touchInputController: TouchInputController;
//     private characterAnimationController: CharacterAnimationController;
//     private tpsCamera: ThirdPersonCameraController
//     private shootHaptic?: Sound;
//     private humanoid?: Humanoid;
//     private connections: RBXScriptConnection[] = [];
//     private reloadTask?: thread;

//     private activated = false;
//     private equipped = false;
//     private shooting = false;
//     private ammo = 0;
//     private reloading = false;

//     constructor(blaster: Tool) {
//         this.blaster = blaster;
//         this.muzzle = this.blaster!.FindFirstChild("Handle")!.FindFirstChild("Muzzle") as Attachment;
//         this.aimAssistController = new AimAssist();
//         // this.viewModelController = new ViewModelController(blaster);
//         this.guiController = new GuiController(blaster);
//         this.touchInputController = new TouchInputController(blaster);
//         this.characterAnimationController = new CharacterAnimationController(blaster);
//         this.shootHaptic = blaster.FindFirstChild("Haptics")?.FindFirstChild("ShootHaptic") as Sound;

//         this.ammo = blaster.GetAttribute(Constants.AMMO_ATTRIBUTE) as number;
//         this.reloading = blaster.GetAttribute(Constants.RELOADING_ATTRIBUTE) as boolean;

//         this.initialize();
//         // print("BlasterController Initialize for: ", blaster.Name)
//     }

//     private isHumanoidAlive(): boolean {
//         return this.humanoid !== undefined && this.humanoid.Health > 0;
//     }

//     private canShoot(): boolean {
//         return this.isHumanoidAlive() && this.equipped && this.ammo > 0 && !this.reloading;
//     }

//     private canReload(): boolean {
//         const magazineSize = this.blaster.GetAttribute(Constants.MAGAZINE_SIZE_ATTRIBUTE) as number;
//         return this.isHumanoidAlive() && this.equipped && this.ammo < magazineSize && !this.reloading;
//     }

//     private recoil(): void {
//         const recoilMin = this.blaster.GetAttribute(Constants.RECOIL_MIN_ATTRIBUTE) as Vector2;
//         const recoilMax = this.blaster.GetAttribute(Constants.RECOIL_MAX_ATTRIBUTE) as Vector2;

//         const x = recoilMin.X + random.NextNumber() * (recoilMax.X - recoilMin.X);
//         const y = recoilMin.Y + random.NextNumber() * (recoilMax.Y - recoilMin.Y);

//         CameraRecoiler.recoil(new Vector2(math.rad(-x), math.rad(y)));
//     }

//     private shoot(): void {
//         const spread = math.rad(this.blaster.GetAttribute(Constants.SPREAD_ATTRIBUTE) as number);
//         const raysPerShot = this.blaster.GetAttribute(Constants.RAYS_PER_SHOT_ATTRIBUTE) as number;
//         const range = this.blaster.GetAttribute(Constants.RANGE_ATTRIBUTE) as number;
//         const rayRadius = this.blaster.GetAttribute(Constants.RAY_RADIUS_ATTRIBUTE) as number;

//         // this.viewModelController.playShootAnimation();
//         this.characterAnimationController.playShootAnimation();
//         // this.recoil();
//         this.tpsCamera?.addRecoil(new Vector2(math.rad(-x), math.rad(y)));

//         this.ammo -= 1;
//         this.guiController.setAmmo(this.ammo);

//         const now = Workspace.GetServerTimeNow();
//         const origin = camera.CFrame;

//         const rayDirections = getRayDirections(origin, raysPerShot, spread, now).map((dir) => dir.mul(range));
//         const rayResults = castRays(player, origin.Position, rayDirections, rayRadius);

//         const tagged: Record<string, { humanoid: Humanoid; isCritical: boolean }> = {};
//         let didTag = false;

//         for (const [index, result] of pairs(rayResults)) {
//             if (result.taggedHumanoid) {
//                 tagged[tostring(index)] = {
//                     humanoid: result.taggedHumanoid,
//                     isCritical: result.isCritical ?? false,
//                 };
//                 didTag = true;
//             }
//         }


//         if (didTag) {
//             this.guiController.showHitmarker();

//             this.guiController.newBillboard(tagged, {
//                 normal: this.blaster.GetAttribute(Constants.DAMAGE_ATTRIBUTE) as number,
//                 critical: this.blaster.GetAttribute(Constants.CRITICAL_DAMAGE_ATTRIBUTE) as number,
//             });
//         }


//         // print("Firing shoot remote")
//         shootRemote.FireServer(now, this.blaster, origin, tagged);

//         // const muzzlePosition = this.viewModelController.getMuzzlePosition();
//         const muzzlePosition = this.muzzle.WorldPosition; //------------------------------------------ Change Maybe??? Maybe to character head position
//         drawRayResults(muzzlePosition, rayResults);

//         this.shootHaptic?.Play();
//     }

//     public startShooting(): void {
//         if (this.ammo === 0) {
//             this.reload();
//             return;
//         }
//         if (!this.canShoot() || this.shooting) return;

//         const fireMode = this.blaster.GetAttribute(Constants.FIRE_MODE_ATTRIBUTE);
//         const rateOfFire = this.blaster.GetAttribute(Constants.RATE_OF_FIRE_ATTRIBUTE) as number;

//         if (fireMode === Constants.FIRE_MODE.SEMI) {
//             this.shooting = true;
//             this.shoot();
//             task.delay(60 / rateOfFire, () => {
//                 this.shooting = false;
//                 if (this.ammo === 0) this.reload();
//             });
//         } else if (fireMode === Constants.FIRE_MODE.AUTO) {
//             task.spawn(() => {
//                 this.shooting = true;
//                 while (this.activated && this.canShoot()) {
//                     this.shoot();
//                     task.wait(60 / rateOfFire);
//                 }
//                 this.shooting = false;
//                 if (this.ammo === 0) this.reload();
//             });
//         }
//     }

//     public reload(): void {
//         if (!this.canReload()) return;

//         const reloadTime = this.blaster.GetAttribute(Constants.RELOAD_TIME_ATTRIBUTE) as number;
//         const magazineSize = this.blaster.GetAttribute(Constants.MAGAZINE_SIZE_ATTRIBUTE) as number;

//         // this.viewModelController.playReloadAnimation(reloadTime);
//         this.characterAnimationController.playReloadAnimation(reloadTime);

//         this.reloading = true;
//         this.guiController.setReloading(this.reloading);
//         reloadRemote.FireServer(this.blaster);

//         this.reloadTask = task.delay(reloadTime, () => {
//             this.ammo = magazineSize;
//             this.reloading = false;
//             this.reloadTask = undefined;
//             this.guiController.setAmmo(this.ammo);
//             this.guiController.setReloading(this.reloading);
//         });
//     }

//     public activate(): void {
//         if (this.activated) return;
//         this.activated = true;
//         this.startShooting();
//     }

//     public deactivate(): void {
//         if (!this.activated) return;
//         this.activated = false;
//     }

//     public equip(): void {
//         if (this.equipped) return;
//         this.equipped = true;

//         this.ammo = this.blaster.GetAttribute(Constants.AMMO_ATTRIBUTE) as number;
//         this.reloading = this.blaster.GetAttribute(Constants.RELOADING_ATTRIBUTE) as boolean;

//         const range = this.blaster.GetAttribute(Constants.AIM_ASSIST_RANGE_ATTRIBUTE) as number;
//         const fov = this.blaster.GetAttribute(Constants.AIM_ASSIST_FOV_ATTRIBUTE) as number;
//         const friction = this.blaster.GetAttribute(Constants.AIM_ASSIST_FRICTION_STRENGTH_ATTRIBUTE) as number;
//         const tracking = this.blaster.GetAttribute(Constants.AIM_ASSIST_TRACKING_STRENGTH_ATTRIBUTE) as number;
//         const centering = this.blaster.GetAttribute(Constants.AIM_ASSIST_CENTERING_STRENGTH_ATTRIBUTE) as number;


//         this.tpsCamera = new ThirdPersonCameraController();
//         this.tpsCamera.enable();
//         // this.aimAssistController.setSubject(camera);
//         // this.aimAssistController.setRange(range);
//         // this.aimAssistController.setFieldOfView(fov);
//         // this.aimAssistController.addTargetTag(Constants.AIM_ASSIST_TARGET_TAG);
//         // this.aimAssistController.addPlayerTargets(true, true);
//         // this.aimAssistController.setMethodStrength(AimAssistEnum.AimAssistMethod.Friction, friction);
//         // this.aimAssistController.setMethodStrength(AimAssistEnum.AimAssistMethod.Tracking, tracking);
//         // this.aimAssistController.setMethodStrength(AimAssistEnum.AimAssistMethod.Centering, centering);
//         // this.aimAssistController.setEasingFunc(AimAssistEnum.AimAssistEasingAttribute.Distance, (distance) =>
//         //     distance < Constants.AIM_ASSIST_MIN_RANGE ? 0 : 1,
//         // );
//         // this.aimAssistController.setDebug(false);
//         // this.aimAssistController.enable();

//         // this.viewModelController.enable();
//         this.guiController.setAmmo(this.ammo);
//         this.guiController.setReloading(this.reloading);
//         this.guiController.enable();
//         this.touchInputController.enable();
//         this.characterAnimationController.enable();

//         this.humanoid = this.blaster.Parent?.FindFirstChildOfClass("Humanoid");


//         game.GetService("RunService").RenderStepped.Connect(() => {
//             print("MouseBehavior:", UserInputService.MouseBehavior);
//         });
//     }

//     public unequip(): void {
//         if (!this.equipped) return;
//         this.equipped = false;

//         this.tpsCamera?.disable();
//         this.tpsCamera = undefined;

//         this.deactivate();

//         if (this.reloadTask) {
//             task.cancel(this.reloadTask);
//             this.reloadTask = undefined;
//         }

//         this.aimAssistController.setDebug(false);
//         this.aimAssistController.disable();

//         // this.viewModelController.disable();
//         this.guiController.disable();
//         this.touchInputController.disable();
//         this.characterAnimationController.disable();
//     }

//     private initialize(): void {
//         this.connections.push(
//             this.blaster.Equipped.Connect(() => this.equip()),
//             this.blaster.Unequipped.Connect(() => this.unequip()),
//             this.blaster.Activated.Connect(() => this.activate()),
//             this.blaster.Deactivated.Connect(() => this.deactivate()),
//             UserInputService.InputBegan.Connect((input, processed) => {
//                 if (processed) return;
//                 if (
//                     input.KeyCode === Constants.KEYBOARD_RELOAD_KEY_CODE ||
//                     input.KeyCode === Constants.GAMEPAD_RELOAD_KEY_CODE
//                 ) {
//                     this.reload();
//                 }
//             }),

//             UserInputService.InputChanged.Connect((input) => {
//                 if (
//                     input.UserInputType === Enum.UserInputType.Gamepad1 &&
//                     (input.KeyCode === Enum.KeyCode.Thumbstick1 || input.KeyCode === Enum.KeyCode.Thumbstick2)
//                 ) {
//                     this.aimAssistController.updateGamepadEligibility(input.KeyCode, input.Position);
//                 }
//             }),
//             UserInputService.TouchPan.Connect(() => {
//                 this.aimAssistController.updateTouchEligibility();
//             }),
//         );


//         this.touchInputController.setReloadCallback(() => this.reload());
//     }



//     public destroy(): void {
//         this.unequip();
//         disconnectAndClear(this.connections);
//         this.aimAssistController.destroy();
//         // this.viewModelController.destroy();
//         this.touchInputController.destroy();
//         this.characterAnimationController.destroy();
//         this.guiController.destroy();
//     }
// }
import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import Constants from "./Constants";
import TouchInputController from "./TouchInputcontroller";
import CharacterAnimationController from "./CharacterAnimationController";
import GuiController from "./GuiController";
import disconnectAndClear from "Common/shared/Utility/disconnectAndClear";
import { getRayDirections } from "../Utility/getRayDirection";
import { drawRayResults } from "../Utility/drawRayResults";
import { castRays } from "../Utility/castRays";
import ThirdPersonCameraController from "./ThirdPersonCamera";

const player = Players.LocalPlayer;
const camera = Workspace.CurrentCamera!;
const remotes = ReplicatedStorage.WaitForChild("Blaster").WaitForChild("Remotes") as Folder;
const shootRemote = remotes.WaitForChild("Shoot") as RemoteEvent;
const reloadRemote = remotes.WaitForChild("Reload") as RemoteEvent;

const random = new Random();

export class BlasterController {
    private blaster: Tool;
    private muzzle: Attachment;
    private guiController: GuiController;
    private touchInputController: TouchInputController;
    private characterAnimationController: CharacterAnimationController;
    private tpsCamera?: ThirdPersonCameraController;
    private shootHaptic?: Sound;
    private humanoid?: Humanoid;
    private connections: RBXScriptConnection[] = [];
    private reloadTask?: thread;

    private activated = false;
    private equipped = false;
    private shooting = false;
    private ammo = 0;
    private reloading = false;

    constructor(blaster: Tool) {
        this.blaster = blaster;
        this.muzzle = this.blaster!.FindFirstChild("Handle")!.FindFirstChild("Muzzle") as Attachment;
        this.guiController = new GuiController(blaster);
        this.touchInputController = new TouchInputController(blaster);
        this.characterAnimationController = new CharacterAnimationController(blaster);
        this.shootHaptic = blaster.FindFirstChild("Haptics")?.FindFirstChild("ShootHaptic") as Sound;

        this.ammo = blaster.GetAttribute(Constants.AMMO_ATTRIBUTE) as number;
        this.reloading = blaster.GetAttribute(Constants.RELOADING_ATTRIBUTE) as boolean;

        this.initialize();
    }

    private isHumanoidAlive(): boolean {
        return this.humanoid !== undefined && this.humanoid.Health > 0;
    }

    private canShoot(): boolean {
        return this.isHumanoidAlive() && this.equipped && this.ammo > 0 && !this.reloading;
    }

    private canReload(): boolean {
        const magazineSize = this.blaster.GetAttribute(Constants.MAGAZINE_SIZE_ATTRIBUTE) as number;
        return this.isHumanoidAlive() && this.equipped && this.ammo < magazineSize && !this.reloading;
    }

    private shoot(): void {
        const spread = math.rad(this.blaster.GetAttribute(Constants.SPREAD_ATTRIBUTE) as number);
        const raysPerShot = this.blaster.GetAttribute(Constants.RAYS_PER_SHOT_ATTRIBUTE) as number;
        const range = this.blaster.GetAttribute(Constants.RANGE_ATTRIBUTE) as number;
        const rayRadius = this.blaster.GetAttribute(Constants.RAY_RADIUS_ATTRIBUTE) as number;

        this.characterAnimationController.playShootAnimation();

        // Recoil injection: scaled and smoothed
        const recoilMin = this.blaster.GetAttribute(Constants.RECOIL_MIN_ATTRIBUTE) as Vector2;
        const recoilMax = this.blaster.GetAttribute(Constants.RECOIL_MAX_ATTRIBUTE) as Vector2;
        const rx = recoilMin.X + random.NextNumber() * (recoilMax.X - recoilMin.X);
        const ry = recoilMin.Y + random.NextNumber() * (recoilMax.Y - recoilMin.Y);
        this.tpsCamera?.addRecoil(new Vector2(math.rad(rx), math.rad(ry)));

        this.ammo -= 1;
        this.guiController.setAmmo(this.ammo);

        const now = Workspace.GetServerTimeNow();
        const origin = camera.CFrame;

        const rayDirections = getRayDirections(origin, raysPerShot, spread, now).map((dir) => dir.mul(range));
        const rayResults = castRays(player, origin.Position, rayDirections, rayRadius);

        const tagged: Record<string, { humanoid: Humanoid; isCritical: boolean }> = {};
        let didTag = false;

        for (const [index, result] of pairs(rayResults)) {
            if (result.taggedHumanoid) {
                tagged[tostring(index)] = {
                    humanoid: result.taggedHumanoid,
                    isCritical: result.isCritical ?? false,
                };
                didTag = true;
            }
        }
        if (didTag) {
            this.guiController.showHitmarker();
            this.guiController.newBillboard(tagged, {
                normal: this.blaster.GetAttribute(Constants.DAMAGE_ATTRIBUTE) as number,
                critical: this.blaster.GetAttribute(Constants.CRITICAL_DAMAGE_ATTRIBUTE) as number,
            });
        }

        shootRemote.FireServer(now, this.blaster, origin, tagged);

        const muzzlePosition = this.muzzle.WorldPosition;
        drawRayResults(muzzlePosition, rayResults);

        this.shootHaptic?.Play();
    }

    public startShooting(): void {
        if (this.ammo === 0) {
            this.reload();
            return;
        }
        if (!this.canShoot() || this.shooting) return;

        const fireMode = this.blaster.GetAttribute(Constants.FIRE_MODE_ATTRIBUTE);
        const rateOfFire = this.blaster.GetAttribute(Constants.RATE_OF_FIRE_ATTRIBUTE) as number;

        if (fireMode === Constants.FIRE_MODE.SEMI) {
            this.shooting = true;
            this.shoot();
            task.delay(60 / rateOfFire, () => {
                this.shooting = false;
                if (this.ammo === 0) this.reload();
            });
        } else if (fireMode === Constants.FIRE_MODE.AUTO) {
            task.spawn(() => {
                this.shooting = true;
                while (this.activated && this.canShoot()) {
                    this.shoot();
                    task.wait(60 / rateOfFire);
                }
                this.shooting = false;
                if (this.ammo === 0) this.reload();
            });
        }
    }

    public reload(): void {
        if (!this.canReload()) return;

        const reloadTime = this.blaster.GetAttribute(Constants.RELOAD_TIME_ATTRIBUTE) as number;
        const magazineSize = this.blaster.GetAttribute(Constants.MAGAZINE_SIZE_ATTRIBUTE) as number;

        this.characterAnimationController.playReloadAnimation(reloadTime);

        this.reloading = true;
        this.guiController.setReloading(this.reloading);
        reloadRemote.FireServer(this.blaster);

        this.reloadTask = task.delay(reloadTime, () => {
            this.ammo = magazineSize;
            this.reloading = false;
            this.reloadTask = undefined;
            this.guiController.setAmmo(this.ammo);
            this.guiController.setReloading(this.reloading);
        });
    }

    public activate(): void {
        if (this.activated) return;
        this.activated = true;
        this.startShooting();
    }

    public deactivate(): void {
        if (!this.activated) return;
        this.activated = false;
    }

    public equip(): void {
        if (this.equipped) return;
        this.equipped = true;

        this.ammo = this.blaster.GetAttribute(Constants.AMMO_ATTRIBUTE) as number;
        this.reloading = this.blaster.GetAttribute(Constants.RELOADING_ATTRIBUTE) as boolean;

        // Enable third-person camera with smooth transition
        this.tpsCamera = new ThirdPersonCameraController();
        this.tpsCamera.enable();

        this.guiController.setAmmo(this.ammo);
        this.guiController.setReloading(this.reloading);
        this.guiController.enable();
        this.touchInputController.enable();
        this.characterAnimationController.enable();

        this.humanoid = this.blaster.Parent?.FindFirstChildOfClass("Humanoid");
    }

    public unequip(): void {
        if (!this.equipped) return;
        this.equipped = false;

        this.tpsCamera?.disable();
        this.tpsCamera = undefined;

        this.deactivate();

        if (this.reloadTask) {
            task.cancel(this.reloadTask);
            this.reloadTask = undefined;
        }

        this.guiController.disable();
        this.touchInputController.disable();
        this.characterAnimationController.disable();
    }

    private initialize(): void {
        this.connections.push(
            this.blaster.Equipped.Connect(() => this.equip()),
            this.blaster.Unequipped.Connect(() => this.unequip()),
            this.blaster.Activated.Connect(() => this.activate()),
            this.blaster.Deactivated.Connect(() => this.deactivate()),
        );

        this.touchInputController.setReloadCallback(() => this.reload());
    }

    public destroy(): void {
        this.unequip();
        disconnectAndClear(this.connections);
        this.touchInputController.destroy();
        this.characterAnimationController.destroy();
        this.guiController.destroy();
    }
}


