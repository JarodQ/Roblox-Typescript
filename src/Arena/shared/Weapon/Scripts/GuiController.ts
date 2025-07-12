import {
    Players,
    ReplicatedStorage,
    SoundService,
    TweenService,
    UserInputService,
} from "@rbxts/services";
import { Constants } from "Arena/shared/Weapon/Constants";
import * as InputCategorizer from "Arena/shared/Weapon/Scripts/InputCategorizer";
import { disconnectAndClear } from "Arena/shared//Utility/disconnectAndClear";
import { playSoundFromSource } from "Arena/shared/Weapon/Utility/playSoundFromSource";
import { getPREFAB } from "Arena/shared/PREFABS";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

const weaponGuiFolder = getPREFAB("UI", "WeaponGui") as Folder;
const blasterGuiTemplate = weaponGuiFolder.WaitForChild("BlasterGui") as ScreenGui;
const reticleGuiTemplate = weaponGuiFolder.WaitForChild("Reticle") as ScreenGui;
//const blasterGuiTemplate = script.WaitForChild("BlasterGui") as ScreenGui;
//const reticleGuiTemplate = script.WaitForChild("ReticleGui") as ScreenGui;
const hitmarkerSound = script.WaitForChild("Hitmarker") as AudioPlayer;
const audioTarget = SoundService.WaitForChild("Audio").WaitForChild("Busses").WaitForChild("UI").WaitForChild("AudioCompressor");

const AMMO_TEXT_FORMAT_STRING = `<font transparency="0.5">%s</font>%s`;

export class GuiController {
    private blaster: Tool;
    private blasterGui: ScreenGui;
    private reticleGui: ScreenGui;
    private hitmarkerScaleTween: Tween;
    private hitmarkerTransparencyTween: Tween;
    private enabled = false;
    private leadingZeros: number;
    private ammo = 0;
    private reloading = false;
    private connections: RBXScriptConnection[] = [];

    constructor(blaster: Tool) {
        this.blaster = blaster;

        const magazineSize = blaster.GetAttribute(Constants.MAGAZINE_SIZE_ATTRIBUTE) as number;
        this.leadingZeros = tostring(magazineSize).size();

        this.blasterGui = blasterGuiTemplate.Clone();
        const blasterFrame = this.blasterGui.WaitForChild("Blaster") as Frame;
        const iconLabel = blasterFrame.WaitForChild("IconLabel") as ImageLabel;
        const ammoFrame = blasterFrame.WaitForChild("Ammo") as Frame;
        const magazineLabel = ammoFrame.WaitForChild("MagazineLabel") as TextLabel;
        this.blasterGui.Enabled = false;
        this.blasterGui.Parent = playerGui;

        this.reticleGui = reticleGuiTemplate.Clone();
        const hitmarker = this.reticleGui.WaitForChild("Hitmarker") as CanvasGroup;
        const hitmarkerUIScale = hitmarker.WaitForChild("UIScale") as UIScale;
        this.reticleGui.Enabled = false;
        this.reticleGui.Parent = playerGui;

        const scaleTweenInfo = new TweenInfo(0.2, Enum.EasingStyle.Back, Enum.EasingDirection.Out);
        const transparencyTweenInfo = new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.In);

        this.hitmarkerScaleTween = TweenService.Create(
            hitmarkerUIScale,
            scaleTweenInfo,
            { Scale: 1 },
        );

        this.hitmarkerTransparencyTween = TweenService.Create(
            hitmarker,
            transparencyTweenInfo,
            { GroupTransparency: 1 },
        );

        this.initialize();
    }

    private initialize(): void {
        this.connections.push(
            this.blasterGui.GetPropertyChangedSignal("AbsoluteSize").Connect(() => this.updateScale()),
            InputCategorizer.InputCategorizer.lastInputCategoryChanged.Connect(() => this.updateAlignment()),
        );

        this.updateScale();
        this.updateAlignment();
    }

    private updateScale(): void {
        const minScreenSize = math.min(this.blasterGui.AbsoluteSize.X, this.blasterGui.AbsoluteSize.Y);
        const isSmallScreen = minScreenSize < Constants.UI_SMALL_SCREEN_THRESHOLD;
        const blasterScale = this.blasterGui.WaitForChild("UIScale") as UIScale;
        blasterScale.Scale = isSmallScreen ? Constants.UI_SMALL_SCREEN_SCALE : 1;
    }

    private updateAlignment(): void {
        const lastInputCategory = InputCategorizer.InputCategorizer.getLastInputCategory();
        const blasterFrame = this.blasterGui.WaitForChild("Blaster") as Frame;

        if (lastInputCategory === InputCategorizer.InputCategory.Touch) {
            blasterFrame.AnchorPoint = new Vector2(0.5, 1);
            blasterFrame.Position = new UDim2(0.5, 0, 1, -65);
        } else {
            blasterFrame.AnchorPoint = new Vector2(1, 1);
            blasterFrame.Position = new UDim2(1, 0, 1, 0);
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
        const blasterFrame = this.blasterGui.WaitForChild("Blaster") as Frame;
        const iconLabel = blasterFrame.WaitForChild("IconLabel") as ImageLabel;
        const ammoFrame = blasterFrame.WaitForChild("Ammo") as Frame;
        const ammoLabel = ammoFrame.WaitForChild("AmmoLabel") as TextLabel;
        ammoLabel.Text = string.format(AMMO_TEXT_FORMAT_STRING, zeroText, ammoText);
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
            playSoundFromSource(hitmarkerSound, audioTarget);
        });

        if (this.hitmarkerScaleTween.PlaybackState === Enum.PlaybackState.Playing) {
            this.hitmarkerScaleTween.Cancel();
        }
        if (this.hitmarkerTransparencyTween.PlaybackState === Enum.PlaybackState.Playing) {
            this.hitmarkerTransparencyTween.Cancel();
        }
        const hitmarker = this.reticleGui.WaitForChild("Hitmarker") as CanvasGroup;
        const hitmarkerUIScale = hitmarker.WaitForChild("UIScale") as UIScale;
        hitmarker.GroupTransparency = 0;
        hitmarkerUIScale.Scale = 2;

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