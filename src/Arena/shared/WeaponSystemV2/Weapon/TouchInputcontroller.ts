import { Players, ReplicatedStorage, UserInputService } from "@rbxts/services";
import Constants from "../Constants";
import InputCategorizer from "./InputCategorizer";
import disconnectAndClear from "Common/shared/Utility/disconnectAndClear";

const player = Players.LocalPlayer!;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
const objectsFolder = ReplicatedStorage.WaitForChild("Blaster").WaitForChild("Objects");
const touchGuiTemplate = objectsFolder.WaitForChild("BlasterTouchGui") as ScreenGui;

class TouchInputController {
    private blaster: Tool;
    private gui: ScreenGui;
    private enabled = false;
    private connections: RBXScriptConnection[] = [];
    private shootInputObject?: InputObject;
    private reloadCallback?: () => void;

    constructor(blaster: Tool) {
        this.blaster = blaster;
        this.gui = touchGuiTemplate.Clone();
        this.gui.Enabled = false;
        this.gui.Parent = playerGui;
    }

    private updateScale() {
        const minScreenSize = math.min(this.gui.AbsoluteSize.X, this.gui.AbsoluteSize.Y);
        const isSmallScreen = minScreenSize < Constants.UI_SMALL_SCREEN_THRESHOLD;
        const guiUIScale = this.gui.FindFirstChild("UIScale") as UIScale;
        guiUIScale.Scale = isSmallScreen ? Constants.UI_SMALL_SCREEN_SCALE : 1;
    }

    private enableTouchInput() {
        this.gui.Enabled = true;
        this.blaster.ManualActivationOnly = true;
    }

    private disableTouchInput() {
        this.gui.Enabled = false;
        this.blaster.ManualActivationOnly = false;
    }

    private onReloadButtonInput(inputObject: InputObject) {
        if (inputObject.UserInputType !== Enum.UserInputType.Touch) return;
        this.reloadCallback?.();
    }

    private onShootButtonInput(inputObject: InputObject) {
        if (inputObject.UserInputType !== Enum.UserInputType.Touch) return;
        this.shootInputObject = inputObject;
        this.blaster.Activate();
    }

    private onInputEnded(inputObject: InputObject) {
        if (this.shootInputObject === inputObject) {
            this.shootInputObject = undefined;
            this.blaster.Deactivate();
        }
    }

    setReloadCallback(callback: () => void) {
        this.reloadCallback = callback;
    }

    enable() {
        if (this.enabled) return;
        this.enabled = true;

        this.connections.push(
            InputCategorizer.lastInputCategoryChanged.Connect((lastInputCategory) => {
                this.onLastInputCategoryChanged(lastInputCategory);
            }),
        );

        this.connections.push(
            this.gui.GetPropertyChangedSignal("AbsoluteSize").Connect(() => {
                this.updateScale();
            }),
        );

        const buttons = this.gui.WaitForChild("Buttons") as Frame;
        const shootButton = buttons.WaitForChild("ShootButton") as GuiButton;
        const reloadButton = buttons.WaitForChild("ReloadButton") as GuiButton;
        this.connections.push(
            shootButton.InputBegan.Connect((inputObject: InputObject) => {
                if (inputObject.UserInputState === Enum.UserInputState.Change) return;
                this.onShootButtonInput(inputObject);
            }),
        );

        this.connections.push(
            reloadButton.InputBegan.Connect((inputObject: InputObject) => {
                if (inputObject.UserInputState === Enum.UserInputState.Change) return;
                this.onReloadButtonInput(inputObject);
            }),
        );

        this.connections.push(
            UserInputService.InputEnded.Connect((inputObject) => {
                this.onInputEnded(inputObject);
            }),
        );

        const lastInputCategory = InputCategorizer.getLastInputCategory();
        this.onLastInputCategoryChanged(lastInputCategory);
        this.updateScale();
    }

    disable() {
        if (!this.enabled) return;
        this.enabled = false;
        this.disableTouchInput();
        disconnectAndClear(this.connections);
    }

    private onLastInputCategoryChanged(lastInputCategory: string) {
        if (lastInputCategory === InputCategorizer.InputCategory.Touch) {
            this.enableTouchInput();
        } else {
            this.disableTouchInput();
        }
    }

    destroy() {
        this.disable();
        this.gui.Destroy();
    }
}

export = TouchInputController;
