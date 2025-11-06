import { Players, ReplicatedStorage, SoundService, TweenService, UserInputService } from "@rbxts/services";
import Constants from "../Constants";
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
}

export default GuiController;
