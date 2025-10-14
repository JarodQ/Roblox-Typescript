import { ReplicatedStorage } from "@rbxts/services";
import { switchModel } from "./shopModelController";

const shopRemoteEvent = ReplicatedStorage.WaitForChild("shopRemoteEvent") as RemoteEvent;

export type GuiElements = {
    txtButtons: Map<string, TextButton>;
    imgButtons: Map<string, ImageButton>;
    txtLabels: Map<string, TextLabel>;
    imgLabels: Map<string, ImageLabel>;
    frames: Map<string, Frame>;
    scrollingFrame: Map<string, ScrollingFrame>;
}

export function getGui<T extends GuiObject>(map: Map<string, T>, name: string): T | undefined {
    for (const [key, value] of map) {
        if (key.sub(-name.size() - 1) === "." + name) {
            return value;
        }
    }
    return undefined;
}

let previousClick: GuiObject | undefined;
export const shopFunctions = {
    onSelectClicked(instance: Instance, guiElements: GuiElements) {
        if (previousClick === instance) return;
        if (instance.IsA("GuiObject")) {
            instance.BackgroundTransparency = 0;

            const unlockedText = getGui(guiElements.txtLabels, "ItemUnlocked") as TextLabel;
            const lockedText = getGui(guiElements.txtLabels, "ItemLocked") as TextLabel;
            const itemUnlocked = instance.GetAttribute("Unlocked") as boolean;
            print("itemUnlocked: ", itemUnlocked)
            if (unlockedText && lockedText) {
                if (itemUnlocked) {
                    unlockedText.Visible = true;
                    lockedText.Visible = false;
                    print("unlocked text displayed")
                }
                else if (!itemUnlocked) {
                    unlockedText.Visible = false;
                    lockedText.Visible = true;
                    print("locked text displayed")

                }
            }

            const instanceStroke = instance.FindFirstChild("UIStroke") as UIStroke;
            if (instanceStroke) instanceStroke.Enabled = true;

            for (const child of instance.GetChildren()) {
                if (child.IsA("ImageLabel")) {
                    child.ImageColor3 = Color3.fromRGB(255, 255, 255); // bright white
                }
                if (child.IsA("TextLabel")) {
                    child.TextColor3 = Color3.fromRGB(255, 255, 255); // bright white
                }
            }

            if (previousClick && previousClick.IsA("GuiObject")) {
                previousClick.BackgroundTransparency = 1;

                const previousStroke = previousClick.FindFirstChild("UIStroke") as UIStroke;
                if (previousStroke) previousStroke.Enabled = false;

                for (const child of previousClick.GetChildren()) {
                    if (child.IsA("ImageLabel")) {
                        child.ImageColor3 = Color3.fromRGB(0, 0, 0); // muted gray
                    }
                    if (child.IsA("TextLabel")) {
                        child.TextColor3 = Color3.fromRGB(0, 0, 0); // muted gray
                    }
                }
            }
            previousClick = instance;
        }
        switchModel(instance, guiElements);
    },
    onWeaponSelectClicked(instance: Instance, guiElements: GuiElements) {
        print("On Weapon Select Clicked");
        const vipFrame = getGui(guiElements.scrollingFrame, "VIPFrame");
        const weaponFrame = getGui(guiElements.scrollingFrame, "WeaponFrame");
        const cropFrame = getGui(guiElements.scrollingFrame, "CropFrame");
        print(vipFrame, weaponFrame, cropFrame)
        if (vipFrame) vipFrame.Visible = false;
        if (weaponFrame) weaponFrame.Visible = true;
        if (cropFrame) cropFrame.Visible = false;
    },
    onCropSelectClicked(instance: Instance, guiElements: GuiElements) {
        print("On Crop Select Clicked");
        const vipFrame = getGui(guiElements.scrollingFrame, "VIPFrame");
        const weaponFrame = getGui(guiElements.scrollingFrame, "WeaponFrame");
        const cropFrame = getGui(guiElements.scrollingFrame, "CropFrame");
        if (vipFrame) vipFrame.Visible = false;
        if (weaponFrame) weaponFrame.Visible = false;
        if (cropFrame) cropFrame.Visible = true;
    },
    onVIPSelectClicked(instance: Instance, guiElements: GuiElements) {
        print("On VIP Select Clicked");
        const vipFrame = getGui(guiElements.scrollingFrame, "VIPFrame");
        const weaponFrame = getGui(guiElements.scrollingFrame, "WeaponFrame");
        const cropFrame = getGui(guiElements.scrollingFrame, "CropFrame");
        if (vipFrame) vipFrame.Visible = true;
        if (weaponFrame) weaponFrame.Visible = false;
        if (cropFrame) cropFrame.Visible = false;
    },
    onBuyClicked(instance: Instance, guiElements: GuiElements) {
        print("Buy button clicked");
        shopRemoteEvent.FireServer("Buy", instance.GetAttribute("Item"));
    },
    onSellClicked(instance: Instance, guiElements: GuiElements) {
        print("Sell button clicked!");
    },
    onCloseClicked(instance: Instance, guiElements: GuiElements) {
        print("Close Button clicked!");
    },
    onRobuxBuy(instance: Instance, guiElements: GuiElements) {
        print("Buy with Robux clicked!");
    },
    onOpenBuy(instance: Instance, guiElements: GuiElements) {
        print("Open Buy Store!");
        const vipFrame = getGui(guiElements.frames, "VIPFrame");
        const buyFrame = getGui(guiElements.frames, "BuyFrame");
        const sellFrame = getGui(guiElements.frames, "SellFrame");
        if (vipFrame) vipFrame.Visible = false;
        if (buyFrame) buyFrame.Visible = true;
        if (sellFrame) sellFrame.Visible = false;
    },
    onOpenSell(instance: Instance, guiElements: GuiElements) {
        print("Open Sell Store!");
        const vipFrame = getGui(guiElements.frames, "VIPFrame");
        const buyFrame = getGui(guiElements.frames, "BuyFrame");
        const sellFrame = getGui(guiElements.frames, "SellFrame");
        if (vipFrame) vipFrame.Visible = false;
        if (buyFrame) buyFrame.Visible = false;
        if (sellFrame) sellFrame.Visible = true;
    },
    onOpenVIP(instance: Instance, guiElements: GuiElements) {
        print("Open VIP Store!");
        const vipFrame = getGui(guiElements.frames, "VIPFrame");
        const buyFrame = getGui(guiElements.frames, "BuyFrame");
        const sellFrame = getGui(guiElements.frames, "SellFrame");
        if (vipFrame) vipFrame.Visible = true;
        if (buyFrame) buyFrame.Visible = false;
        if (sellFrame) sellFrame.Visible = false;
    },
}
