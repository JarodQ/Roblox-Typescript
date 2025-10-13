import { ReplicatedStorage } from "@rbxts/services";
import { switchModel } from "./shopModelController";

const shopRemoteEvent = ReplicatedStorage.WaitForChild("shopRemoteEvent") as RemoteEvent;

export type GuiElements = {
    txtButtons: Map<string, TextButton>;
    imgButtons: Map<string, ImageButton>;
    txtLabels: Map<string, TextLabel>;
    imgLabels: Map<string, ImageLabel>;
    frames: Map<string, Frame>;
}

export function getGui<T extends GuiObject>(map: Map<string, T>, name: string): T | undefined {
    for (const [key, value] of map) {
        if (key.sub(-name.size() - 1) === "." + name) {
            return value;
        }
    }
    return undefined;
}

export const shopFunctions = {
    onSelectClicked(instance: Instance, guiElements: GuiElements) {
        print("On Select Clicked");
        switchModel(instance, guiElements);
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
