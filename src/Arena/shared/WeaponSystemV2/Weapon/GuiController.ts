import { Players, ReplicatedStorage, SoundService, TweenService, UserInputService, Debris } from "@rbxts/services";
import Constants from "./Constants";
import InputCategorizer from "./InputCategorizer";
import disconnectAndClear from "Common/shared/Utility/disconnectAndClear";
import playSoundFromSource from "../Utility/playSoundFromSource";



const player = Players.LocalPlayer!;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
const blasterFolder = ReplicatedStorage.WaitForChild("Blaster");
const objectsFolder = blasterFolder.WaitForChild("Objects");
const blasterGuiTemplate = objectsFolder.WaitForChild("BlasterGui") as ScreenGui;
const reticleGuiTemplate = objectsFolder.WaitForChild("ReticleGui") as ScreenGui;
const hitmarkerSound = objectsFolder.WaitForChild("Hitmarker") as AudioPlayer;

const maybeAudio = (SoundService as unknown) as {
    Audio?: {
        Busses?: {
            UI?: {
                AudioCompressor?: Instance;
            };
        };
    };
};

const audioTarget = maybeAudio.Audio!.Busses!.UI!.AudioCompressor;

const AMMO_TEXT_FORMAT_STRING = `<font transparency="0.5">%s</font>%s`;

//Get Gui Objects
;
;
;

class GuiController {
    private blaster: Tool;
    private blasterGui: ScreenGui;
    private blasterFrame: Frame;
    private reticleGui: ScreenGui;
    private hitmarker: CanvasGroup;
    private hitmarkerScale: UIScale;
    private hitmarkerScaleTween: Tween;
    private hitmarkerTransparencyTween: Tween;
    private enabled = false;
    private leadingZeros: number;
    private ammo = 0;
    private ammoLabel: TextLabel;
    private reloading = false;
    private connections: RBXScriptConnection[] = [];

    constructor(blaster: Tool) {
        this.blaster = blaster;

        const magazineSize = blaster.GetAttribute(Constants.MAGAZINE_SIZE_ATTRIBUTE) as number;
        this.leadingZeros = tostring(magazineSize).size();

        this.blasterGui = blasterGuiTemplate.Clone();

        this.blasterFrame = this.blasterGui.WaitForChild("Blaster") as Frame;
        const iconLabel = this.blasterFrame.WaitForChild("IconLabel") as ImageLabel;
        iconLabel.Image = blaster.TextureId;

        const ammoFrame = this.blasterFrame.WaitForChild("Ammo") as Frame;
        this.ammoLabel = ammoFrame.WaitForChild("AmmoLabel") as TextLabel;
        const magazineLabel = ammoFrame.WaitForChild("MagazineLabel") as TextLabel;
        magazineLabel.Text = `/${magazineSize}`;


        this.blasterGui.Enabled = false;
        this.blasterGui.Parent = playerGui;

        this.reticleGui = reticleGuiTemplate.Clone();
        this.reticleGui.Enabled = false;
        this.reticleGui.Parent = playerGui;

        // Cast nested instances to their proper types
        this.hitmarker = this.reticleGui.WaitForChild("Hitmarker") as CanvasGroup;
        this.hitmarkerScale = this.hitmarker.WaitForChild("UIScale") as UIScale;

        const scaleTweenInfo = new TweenInfo(0.2, Enum.EasingStyle.Back, Enum.EasingDirection.Out);
        const transparencyTweenInfo = new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.In);

        this.hitmarkerScaleTween = TweenService.Create(this.hitmarkerScale, scaleTweenInfo, {
            Scale: 1,
        });

        this.hitmarkerTransparencyTween = TweenService.Create(this.hitmarker, transparencyTweenInfo, {
            GroupTransparency: 1,
        });


        this.initialize();
    }

    private initialize(): void {
        this.connections.push(
            this.blasterGui.GetPropertyChangedSignal("AbsoluteSize").Connect(() => this.updateScale()),
            InputCategorizer.lastInputCategoryChanged.Connect(() => this.updateAlignment()),
        );

        this.updateScale();
        this.updateAlignment();
    }

    private updateScale(): void {
        const minScreenSize = math.min(this.blasterGui.AbsoluteSize.X, this.blasterGui.AbsoluteSize.Y);
        const isSmallScreen = minScreenSize < Constants.UI_SMALL_SCREEN_THRESHOLD;
        this.hitmarkerScale.Scale = isSmallScreen ? Constants.UI_SMALL_SCREEN_SCALE : 1;
    }

    private updateAlignment(): void {
        const lastInputCategory = InputCategorizer.getLastInputCategory();
        if (lastInputCategory === InputCategorizer.InputCategory.Touch) {
            this.blasterFrame.AnchorPoint = new Vector2(0.5, 1);
            this.blasterFrame.Position = new UDim2(0.5, 0, 1, -65);
        } else {
            this.blasterFrame.AnchorPoint = new Vector2(1, 1);
            this.blasterFrame.Position = UDim2.fromScale(1, 1);
        }
    }

    private updateAmmoText(): void {
        let zeroText = "";
        let ammoText = "";

        if (this.reloading) {
            zeroText = "-".rep(this.leadingZeros);
        } else {
            ammoText = tostring(this.ammo);
            const numZeros = this.leadingZeros - ammoText.size();
            if (numZeros > 0) {
                zeroText = "0".rep(numZeros);
            }
        }

        this.ammoLabel.Text = string.format(AMMO_TEXT_FORMAT_STRING, zeroText, ammoText);
    }

    public setAmmo(ammo: number): void {
        this.ammo = ammo;
        this.updateAmmoText();
    }

    public setReloading(reloading: boolean): void {
        this.reloading = reloading;
        this.updateAmmoText();
    }

    public showHitmarker(): void {
        task.delay(Constants.HITMARKER_SOUND_DELAY, () => {
            if (audioTarget) playSoundFromSource(hitmarkerSound, audioTarget);
        });

        if (this.hitmarkerScaleTween.PlaybackState === Enum.PlaybackState.Playing) {
            this.hitmarkerScaleTween.Cancel();
        }
        if (this.hitmarkerTransparencyTween.PlaybackState === Enum.PlaybackState.Playing) {
            this.hitmarkerTransparencyTween.Cancel();
        }

        this.hitmarker.GroupTransparency = 0;
        this.hitmarkerScale.Scale = 2;

        this.hitmarkerScaleTween.Play();
        this.hitmarkerTransparencyTween.Play();
    }

    public enable(): void {
        if (this.enabled) return;
        this.enabled = true;
        this.blasterGui.Enabled = true;
        this.reticleGui.Enabled = true;
        UserInputService.MouseIconEnabled = false;
    }

    public disable(): void {
        if (!this.enabled) return;
        this.enabled = false;
        this.blasterGui.Enabled = false;
        this.reticleGui.Enabled = false;
        UserInputService.MouseIconEnabled = true;
    }

    public destroy(): void {
        this.disable();
        disconnectAndClear(this.connections);
        this.blasterGui.Destroy();
        this.reticleGui.Destroy();
    }


    ///Test for billboardGui

    private createBillboard(
        target: Instance,
        damage: number,
        crit: boolean,
    ) {
        const duration = 0.5;

        const billboard = new Instance("BillboardGui");
        billboard.AlwaysOnTop = true;
        billboard.StudsOffset = new Vector3(0, 5, 0);
        billboard.Parent = target;

        const text = new Instance("TextLabel");
        text.Text = tostring(damage);
        text.BackgroundTransparency = 1;
        text.TextScaled = true;
        text.TextStrokeTransparency = 0;
        text.Parent = billboard;

        if (crit) {
            billboard.Size = new UDim2(0, 75, 0, 75);
            text.Size = new UDim2(1, 0, 1, 0);
            text.Font = Enum.Font.Bangers;
            text.TextColor3 = new Color3(1, 0, 0);
        } else {
            billboard.Size = new UDim2(0, 50, 0, 50);
            text.Size = new UDim2(0.9, 0, 0.9, 0);
            text.AnchorPoint = new Vector2(0.5, 0.5);
            text.Position = new UDim2(0.5, 0, 0.5, 0);
            text.Font = Enum.Font.LuckiestGuy;
            text.TextColor3 = new Color3(1, 1, 1);
        }

        const tweenInfo2 = new TweenInfo(0.15, Enum.EasingStyle.Cubic, Enum.EasingDirection.In);
        const tweenInfo3 = new TweenInfo(0.1, Enum.EasingStyle.Cubic, Enum.EasingDirection.In);
        const tweenInfoText = new TweenInfo(0.25, Enum.EasingStyle.Cubic, Enum.EasingDirection.In);

        const tween2 = TweenService.Create(billboard, tweenInfo2, {
            StudsOffset: billboard.StudsOffset.add(new Vector3(-2, 1, 0)),
            Size: new UDim2(0, 10, 0, 10),
        });
        const tween3 = TweenService.Create(billboard, tweenInfo3, {
            StudsOffset: billboard.StudsOffset.add(new Vector3(-3, -2, 0)),
        });
        const tweenText = TweenService.Create(text, tweenInfoText, {
            Rotation: -180,
        });

        Debris.AddItem(billboard, duration);

        // Non-blocking tween sequence
        tweenText.Play();
        tween2.Play();

        tween2.Completed.Connect(() => {
            tween3.Play();
        });
    }


    public newBillboard(
        targets: Record<string, { humanoid: Humanoid; isCritical: boolean }> = {},
        damage: { normal: number; critical: number },
    ) {
        for (const [, { humanoid, isCritical }] of pairs(targets)) {
            const model = humanoid.Parent;
            if (!model || !model.IsA("Model")) continue;

            const existing = model.FindFirstChildOfClass("BillboardGui");

            const finalDamage = (() => {
                if (!existing) return isCritical ? damage.critical : damage.normal;

                const label = existing.FindFirstChildOfClass("TextLabel");
                const stacked = label
                    ? (isCritical ? damage.critical : damage.normal) + (tonumber(label.Text) ?? 0)
                    : isCritical ? damage.critical : damage.normal;

                existing.Destroy();
                return stacked;
            })();

            this.createBillboard(model, finalDamage, isCritical);
        }
    }



    // export function damageHealth(
    //     target: Model,
    //     damage: number,
    //     hit: BasePart,
    //     shooter: Instance,
    //     special: boolean,
    // ) {
    //     const humanoid = target.FindFirstChildOfClass("Humanoid");
    //     if (!humanoid || humanoid.Health <= 0) return;

    //     humanoid.Health -= damage;

    //     const isCritical = hit.Name === "Head";
    //     newBillboard(target, damage, isCritical, special);
    // }

}

export default GuiController;
