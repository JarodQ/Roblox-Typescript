import { Players, ReplicatedStorage, UserInputService, Workspace } from "@rbxts/services";
import { Constants } from "shared/Weapon/Constants";
import { TouchInputController } from "shared/Weapon/Scripts/TouchInputController";
import CameraRecoiler = require("shared/Weapon/Scripts/CameraRecoiler")
import { ViewModelController } from "shared/Weapon/Scripts/ViewModelController";
import { CharacterAnimationController } from "shared/Weapon/Scripts/CharacterAnimationController";
import { GuiController } from "shared/Weapon/Scripts/GuiController";
import { disconnectAndClear } from "shared/Utility/disconnectAndClear";
import { getRayDirections } from "shared/Weapon/Utility/getRayDirections";
import { drawRayResults } from "shared/Weapon/Utility/drawRayResults";
import { castRays, RayResult } from "shared/Weapon/Utility/castRays";

const player = Players.LocalPlayer;
const camera = Workspace.CurrentCamera!;
const remotes = ReplicatedStorage.WaitForChild("Blaster").WaitForChild("Remotes") as Folder;
const shootRemote = remotes.WaitForChild("Shoot") as RemoteEvent;
const reloadRemote = remotes.WaitForChild("Reload") as RemoteEvent;

const rng = new Random();

export class BlasterController {
    private blaster: Tool;
    private viewModelController: ViewModelController;
    private guiController: GuiController;
    private touchInputController: TouchInputController;
    private characterAnimationController: CharacterAnimationController;
    private humanoid?: Humanoid;
    private activated = false;
    private equipped = false;
    private shooting = false;
    private ammo: number;
    private reloading: boolean;
    private reloadTask?: thread;
    private connections: RBXScriptConnection[] = [];

    constructor(blaster: Tool) {
        this.blaster = blaster;
        this.viewModelController = new ViewModelController(blaster);
        this.guiController = new GuiController(blaster);
        this.touchInputController = new TouchInputController(blaster);
        this.characterAnimationController = new CharacterAnimationController(blaster);
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

    private recoil(): void {
        const recoilMin = this.blaster.GetAttribute(Constants.RECOIL_MIN_ATTRIBUTE) as Vector2;
        const recoilMax = this.blaster.GetAttribute(Constants.RECOIL_MAX_ATTRIBUTE) as Vector2;

        const x = recoilMin.X + rng.NextNumber() * (recoilMax.X - recoilMin.X);
        const y = recoilMin.Y + rng.NextNumber() * (recoilMax.Y - recoilMin.Y);
        const recoil = new Vector2(math.rad(-x), math.rad(y));

        CameraRecoiler.recoil(recoil);
    }

    private shoot(): void {
        const spread = this.blaster.GetAttribute(Constants.SPREAD_ATTRIBUTE) as number;
        const raysPerShot = this.blaster.GetAttribute(Constants.RAYS_PER_SHOT_ATTRIBUTE) as number;
        const range = this.blaster.GetAttribute(Constants.RANGE_ATTRIBUTE) as number;
        const rayRadius = this.blaster.GetAttribute(Constants.RAY_RADIUS_ATTRIBUTE) as number;

        this.viewModelController.playShootAnimation();
        this.characterAnimationController.playShootAnimation();
        this.recoil();

        this.ammo -= 1;
        this.guiController.setAmmo(this.ammo);

        const now = Workspace.GetServerTimeNow();
        const origin = camera.CFrame;
        const rayDirections = getRayDirections(origin, raysPerShot, math.rad(spread), now).map((dir) =>
            dir.mul(range),
        );

        const rayResults = castRays(player, origin.Position, rayDirections, rayRadius);

        const tagged: Record<string, Humanoid> = {};
        let didTag = false;

        rayResults.forEach((result, index) => {
            if (result.taggedHumanoid) {
                tagged[tostring(index)] = result.taggedHumanoid;
                didTag = true;
            }
        });

        if (didTag) {
            this.guiController.showHitmarker();
        }

        shootRemote.FireServer(now, this.blaster, origin, tagged);

        const muzzlePosition = this.viewModelController.getMuzzlePosition();
        drawRayResults(muzzlePosition, rayResults);
    }

    private startShooting(): void {
        if (this.ammo === 0) {
            this.reload();
            return;
        }
        if (!this.canShoot() || this.shooting) return;

        const fireMode = this.blaster.GetAttribute(Constants.FIRE_MODE_ATTRIBUTE) as string;
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

    private reload(): void {
        if (!this.canReload()) return;

        const reloadTime = this.blaster.GetAttribute(Constants.RELOAD_TIME_ATTRIBUTE) as number;
        const magazineSize = this.blaster.GetAttribute(Constants.MAGAZINE_SIZE_ATTRIBUTE) as number;

        this.viewModelController.playReloadAnimation(reloadTime);
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

    private activate(): void {
        if (this.activated) return;
        this.activated = true;
        this.startShooting();
    }

    private deactivate(): void {
        if (!this.activated) return;
        this.activated = false;
    }

    private equip(): void {
        if (this.equipped) return;
        this.equipped = true;

        this.ammo = this.blaster.GetAttribute(Constants.AMMO_ATTRIBUTE) as number;
        this.reloading = this.blaster.GetAttribute(Constants.RELOADING_ATTRIBUTE) as boolean;

        this.viewModelController.enable();
        this.guiController.setAmmo(this.ammo);
        this.guiController.setReloading(this.reloading);
        this.guiController.enable();
        this.touchInputController.enable();
        this.characterAnimationController.enable();

        this.humanoid = this.blaster.Parent?.FindFirstChildOfClass("Humanoid") as Humanoid;
    }

    private unequip(): void {
        if (!this.equipped) return;
        this.equipped = false;

        this.deactivate();

        if (this.reloadTask) {
            task.cancel(this.reloadTask);
            this.reloadTask = undefined;
        }

        this.viewModelController.disable();
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
            UserInputService.InputBegan.Connect((input, processed) => {
                if (processed) return;
                if (
                    input.KeyCode === Constants.KEYBOARD_RELOAD_KEY_CODE ||
                    input.KeyCode === Constants.GAMEPAD_RELOAD_KEY_CODE
                ) {
                    this.reload();
                }
            }),
        );

        this.touchInputController.setReloadCallback(() => this.reload());
    }

    public destroy(): void {
        this.unequip();
        disconnectAndClear(this.connections);
        this.viewModelController.destroy();
        this.touchInputController.destroy();
        this.characterAnimationController.destroy();
        this.guiController.destroy();
    }
}