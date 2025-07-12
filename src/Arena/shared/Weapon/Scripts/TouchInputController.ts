import { Players, ReplicatedStorage, UserInputService } from "@rbxts/services";
import { Constants } from "Arena/shared/Weapon/Constants";
import * as InputCategorizer from "./InputCategorizer";
import { disconnectAndClear } from "Arena/shared//Utility/disconnectAndClear";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
const touchGuiTemplate = script.WaitForChild("BlasterTouchGui") as ScreenGui;

export class TouchInputController {
    private blaster: Tool;
    private gui: ScreenGui;
    private enabled = false;
    private connections: RBXScriptConnection[] = [];
    private reloadCallback?: () => void;
    private shootInputObject?: InputObject;

    constructor(blaster: Tool) {
        this.blaster = blaster;
        this.gui = touchGuiTemplate.Clone();
        this.gui.Enabled = false;
        this.gui.Parent = playerGui;
    }

    private updateScale(): void {
        const minScreenSize = math.min(this.gui.AbsoluteSize.X, this.gui.AbsoluteSize.Y);
        const isSmallScreen = minScreenSize < Constants.UI_SMALL_SCREEN_THRESHOLD;
        const UIScale = this.gui.WaitForChild("UIScale") as UIScale;
        UIScale.Scale = isSmallScreen ? Constants.UI_SMALL_SCREEN_SCALE : 1;
    }

    private enableTouchInput(): void {
        this.gui.Enabled = true;
        this.blaster.ManualActivationOnly = true;
    }

    private disableTouchInput(): void {
        this.gui.Enabled = false;
        this.blaster.ManualActivationOnly = false;
    }

    private onReloadButtonInput(inputObject: InputObject): void {
        if (inputObject.UserInputType !== Enum.UserInputType.Touch) return;
        this.reloadCallback?.();
    }

    private onShootButtonInput(inputObject: InputObject): void {
        if (inputObject.UserInputType !== Enum.UserInputType.Touch) return;
        this.shootInputObject = inputObject;
        this.blaster.Activate();
    }

    private onInputEnded(inputObject: InputObject): void {
        if (this.shootInputObject === inputObject) {
            this.shootInputObject = undefined;
            this.blaster.Deactivate();
        }
    }

    public setReloadCallback(callback: () => void): void {
        this.reloadCallback = callback;
    }

    public enable(): void {
        if (this.enabled) return;
        this.enabled = true;

        const guiButtons = this.gui.WaitForChild("Buttons");
        const shootButton = guiButtons.WaitForChild("ShootButton") as TextButton;
        const ReloadButton = guiButtons.WaitForChild("ReloadButton") as TextButton;
        this.connections.push(
            InputCategorizer.InputCategorizer.lastInputCategoryChanged.Connect((category) =>
                this.onLastInputCategoryChanged(category),
            ),
            this.gui.GetPropertyChangedSignal("AbsoluteSize").Connect(() => this.updateScale()),
            shootButton.InputBegan.Connect((input) => {
                if (input.UserInputState !== Enum.UserInputState.Change) {
                    this.onShootButtonInput(input);
                }
            }),
            ReloadButton.InputBegan.Connect((input) => {
                if (input.UserInputState !== Enum.UserInputState.Change) {
                    this.onReloadButtonInput(input);
                }
            }),
            UserInputService.InputEnded.Connect((input) => this.onInputEnded(input)),
        );

        this.onLastInputCategoryChanged(InputCategorizer.InputCategorizer.getLastInputCategory());
        this.updateScale();
    }

    public disable(): void {
        if (!this.enabled) return;
        this.enabled = false;
        this.disableTouchInput();
        disconnectAndClear(this.connections);
    }

    private onLastInputCategoryChanged(lastInputCategory: InputCategorizer.InputCategoryType): void {
        if (lastInputCategory === InputCategorizer.InputCategory.Touch) {
            this.enableTouchInput();
        } else {
            this.disableTouchInput();
        }
    }

    public destroy(): void {
        this.disable();
        this.gui.Destroy();
    }
}