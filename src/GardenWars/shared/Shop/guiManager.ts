import { shopFunctions, resolvePlayerData, parseItemVariant } from "GardenWars/shared/Shop/shopFunctions";
import { ReplicatedStorage } from "@rbxts/services";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";
import { applyHoverExpand, applyHoverShrink, applyPressEffect } from "./effects";

const requestPlayerData = ReplicatedStorage.WaitForChild("RequestPlayerData") as RemoteFunction;

export type GuiElements = {
    txtButtons: Map<string, TextButton>;
    imgButtons: Map<string, ImageButton>;
    txtLabels: Map<string, TextLabel>;
    imgLabels: Map<string, ImageLabel>;
    frames: Map<string, Frame>;
    scrollingFrame: Map<string, ScrollingFrame>;
    txtBox: Map<string, TextBox>;
}

export let guiElements: GuiElements;
let playerGui: ScreenGui;


function getGuiKey(instance: Instance): string {
    return instance.GetFullName();
}

function withDebounce<T extends (...args: unknown[]) => void>(fn: T, delay = 0.3): T {
    let lastClick = 0;
    return ((...args: unknown[]) => {
        const now = tick();
        if (now - lastClick >= delay) {
            lastClick = now;
            //print("⏱ Debounced function firing with args:", args);
            fn(...args);
        }
    }) as T;
}



const buttonBehaviors: Record<string, (instance: Instance) => void> = {
    Select: (instance: Instance) => shopFunctions.onSelectClicked(instance, guiElements),
    PurchaseSelect: (instance: Instance) => shopFunctions.onPurchaseSelectClicked(instance, guiElements),
    Plus1: (instance: Instance) => shopFunctions.onPlus1Clicked(instance, guiElements),
    Plus5: (instance: Instance) => shopFunctions.onPlus5Clicked(instance, guiElements),
    Plus10: (instance: Instance) => shopFunctions.onPlus10Clicked(instance, guiElements),
    Plus25: (instance: Instance) => shopFunctions.onPlus20Clicked(instance, guiElements),
    PlusMax: (instance: Instance) => shopFunctions.onPlusMaxClicked(instance, guiElements),
    Clear: (instance: Instance) => shopFunctions.onClearClicked(instance, guiElements),
    SeedSelect: (instance: Instance) => shopFunctions.onSeedSelectClicked(instance, guiElements),
    WeaponSelect: (instance: Instance) => shopFunctions.onWeaponSelectClicked(instance, guiElements),
    CropSelect: (instance: Instance) => shopFunctions.onCropSelectClicked(instance, guiElements),
    VIPSelect: (instance: Instance) => shopFunctions.onVIPSelectClicked(instance, guiElements),
    Buy: (instance: Instance) => shopFunctions.onBuyClicked(instance, guiElements),
    Sell: (instance: Instance) => shopFunctions.onSellClicked(instance, guiElements),
    CloseButton: (instance: Instance) => shopFunctions.onCloseClicked(instance, guiElements),
    RobuxBuy: (instance: Instance) => shopFunctions.onRobuxBuy(instance, guiElements),
    OpenBuy: (instance: Instance) => shopFunctions.onOpenBuy(instance, guiElements),
    OpenSell: (instance: Instance) => shopFunctions.onOpenSell(instance, guiElements),
    OpenVIP: (instance: Instance) => shopFunctions.onOpenVIP(instance, guiElements),
}

function forEachGuiElement(
    callBack: (guiType: string, name: string, instance: GuiObject) => void,
) {
    for (const [name, instance] of guiElements.txtButtons) callBack("TextButton", name, instance);
    for (const [name, instance] of guiElements.imgButtons) callBack("ImageButton", name, instance);
    for (const [name, instance] of guiElements.txtLabels) callBack("TextLabel", name, instance);
    for (const [name, instance] of guiElements.imgLabels) callBack("ImageLabel", name, instance);
    for (const [name, instance] of guiElements.frames) callBack("Frame", name, instance);
    for (const [name, instance] of guiElements.scrollingFrame) callBack("ScrollingFrame", name, instance);
    for (const [name, instance] of guiElements.txtBox) callBack("TextBox", name, instance);
}



function applyEffects(instance: GuiObject, effectsAttr: string) {
    const effects = effectsAttr.split(",").map((e) => {
        const [trimmed] = e.gsub("^%s*(.-)%s*$", "%1");
        return trimmed.lower();
    });

    for (const effect of effects) {
        switch (effect) {
            case "hoverup":
                applyHoverExpand(instance);
                break;
            case "hoverdown":
                applyHoverShrink(instance);
                break;
            case "press":
                applyPressEffect(instance);
                break;
            default:
                warn(`⚠️ Unknown effect '${effect}' on ${instance.GetFullName()}`);
        }
    }
}

// function setBehaviors() {
//     forEachGuiElement((guiType, name, instance) => {
//         const behaviorKey = instance.GetAttribute("Behavior") as string | undefined;
//         const behavior = behaviorKey ? buttonBehaviors[behaviorKey] : undefined;
//         //print(`Checking ${name} (${guiType}) → behavior:`, behavior);
//         if (behavior) {
//             if (instance.IsA("TextButton") || instance.IsA("ImageButton")) {
//                 //print(`✅ Connecting ${name} to behavior`);
//                 instance.MouseButton1Click.Connect(withDebounce(() => {
//                     //print(`🔥 ${name} clicked`);
//                     //print("Calling behavior with:", instance.GetFullName());
//                     behavior(instance);
//                 }));
//             }
//             else if (instance.IsA("TextLabel") || instance.IsA("ImageLabel")) {
//                 //print("Is an image. Cannot interact");
//             }
//             if (!behaviorKey) {
//                 //print(`⚠️ No Behavior attribute found on ${instance.GetFullName()}`);
//             }
//         }
//     })
//     return;
// }

function setBehaviors() {
    forEachGuiElement((guiType, name, instance) => {
        const behaviorKey = instance.GetAttribute("Behavior") as string | undefined;
        const effectsAttr = instance.GetAttribute("Effects") as string | undefined;

        const behavior = behaviorKey ? buttonBehaviors[behaviorKey] : undefined;

        if (behavior && (instance.IsA("TextButton") || instance.IsA("ImageButton"))) {
            if (effectsAttr) applyEffects(instance, effectsAttr);
            instance.MouseButton1Click.Connect(withDebounce(() => {
                behavior(instance);
            }));
        }

        if (effectsAttr && instance.IsA("GuiObject")) {
            applyEffects(instance, effectsAttr);
        }
    });
}

export interface KeyPathResult {
    exists: boolean;
    path?: string;
    value?: unknown;
}



function setUnlocked(player: Player, guiElements: GuiElements) {
    const playerData = requestPlayerData.InvokeServer() as PlayerData | undefined;
    print("Player's data for setUnlocked: ", playerData)
    if (!playerData) return;
    forEachGuiElement((guiType, name, instance) => {
        if (guiType !== "TextButton" && guiType !== "ImageButton") return;
        const variantInfo = parseItemVariant(instance.Name);

        const keyPath = instance.GetAttribute("Item") as string;
        if (!keyPath) return;

        const result = resolvePlayerData(playerData, keyPath);
        print(`Key Path: ${keyPath}, Value: ${result.value}, for Instance: ${instance.Name}`)
        const isUnlocked = result.value === true;
        if (isUnlocked && variantInfo.variant === "U") {
            //instance.SetAttribute("Unlocked", true);
            instance.Visible = true;
        }
        else if (!isUnlocked && variantInfo.variant === "L") {
            //instance.SetAttribute("Unlocked", false);
            instance.Visible = true;
        }

    });
}

function findGuiElements(player: Player, container: Instance) {
    const txtButtons = new Map<string, TextButton>();
    const imgButtons = new Map<string, ImageButton>();
    const txtLabels = new Map<string, TextLabel>();
    const imgLabels = new Map<string, ImageLabel>();
    const frames = new Map<string, Frame>();
    const scrollingFrame = new Map<string, ScrollingFrame>();
    const txtBox = new Map<string, TextBox>();

    for (const child of container.GetDescendants()) {
        if (child.IsA("TextButton")) txtButtons.set(getGuiKey(child), child);
        if (child.IsA("ImageButton")) imgButtons.set(getGuiKey(child), child);
        if (child.IsA("TextLabel")) txtLabels.set(getGuiKey(child), child);
        if (child.IsA("ImageLabel")) imgLabels.set(getGuiKey(child), child);
        if (child.IsA("Frame")) frames.set(getGuiKey(child), child);
        if (child.IsA("ScrollingFrame")) scrollingFrame.set(getGuiKey(child), child);
        if (child.IsA("TextBox")) txtBox.set(getGuiKey(child), child);

    }
    guiElements = { txtButtons, imgButtons, txtLabels, imgLabels, frames, scrollingFrame, txtBox };
    setUnlocked(player, guiElements);
    setBehaviors();
    return;
}


export function setupGui(player: Player, gui: ScreenGui) {
    playerGui = gui;
    findGuiElements(player, gui);
    return;
}




