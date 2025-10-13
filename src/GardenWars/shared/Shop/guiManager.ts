import { shopFunctions } from "GardenWars/shared/Shop/shopFunctions";
import { playerCache } from "Common/shared/PlayerData/PlayerDataService";
import { ReplicatedStorage } from "@rbxts/services";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";

const requestPlayerData = ReplicatedStorage.WaitForChild("RequestPlayerData") as RemoteFunction;

type GuiElements = {
    txtButtons: Map<string, TextButton>;
    imgButtons: Map<string, ImageButton>;
    txtLabels: Map<string, TextLabel>;
    imgLabels: Map<string, ImageLabel>;
    frames: Map<string, Frame>;
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
}

function setBehaviors() {
    forEachGuiElement((guiType, name, instance) => {
        const behaviorKey = instance.GetAttribute("Behavior") as string | undefined;
        const behavior = behaviorKey ? buttonBehaviors[behaviorKey] : undefined;
        //print(`Checking ${name} (${guiType}) → behavior:`, behavior);
        if (behavior) {
            if (instance.IsA("TextButton") || instance.IsA("ImageButton")) {
                //print(`✅ Connecting ${name} to behavior`);
                instance.MouseButton1Click.Connect(withDebounce(() => {
                    //print(`🔥 ${name} clicked`);
                    //print("Calling behavior with:", instance.GetFullName());
                    behavior(instance);
                }));
            }
            else if (instance.IsA("TextLabel") || instance.IsA("ImageLabel")) {
                //print("Is an image. Cannot interact");
            }
            if (!behaviorKey) {
                //print(`⚠️ No Behavior attribute found on ${instance.GetFullName()}`);
            }
        }
    })
    return;
}

export interface KeyPathResult {
    exists: boolean;
    path?: string;
    value?: unknown;
}

export function resolvePlayerData(playerData: PlayerData, key: string,): KeyPathResult {
    function search(obj: unknown, currentPath: string[] = []): KeyPathResult {
        if (typeOf(obj) !== "table") return { exists: false };

        for (const [k, value] of pairs(obj as Record<string, unknown>)) {
            const newPath = [...currentPath, k];

            if (k === key) {
                return {
                    exists: true,
                    path: newPath.join("."),
                    value,
                };
            }

            const result = search(value, newPath);
            if (result.exists) return result;
        }

        return { exists: false };
    }

    return search(playerData);
}

function parseItemVariant(name: string): { base: string; variant: "L" | "U" | undefined } {
    const [base, variant] = name.match("^(.*)_([LU])$") as LuaTuple<[string, string]>;

    if (!base || !variant) return { base: name, variant: undefined };
    return { base, variant: variant as "L" | "U" };
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
            instance.SetAttribute("Unlocked", isUnlocked);
            instance.Visible = true;
        }
        else if (!isUnlocked && variantInfo.variant === "L") {
            instance.SetAttribute("Unlocked", isUnlocked);
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

    for (const child of container.GetDescendants()) {
        if (child.IsA("TextButton")) txtButtons.set(getGuiKey(child), child);
        if (child.IsA("ImageButton")) imgButtons.set(getGuiKey(child), child);
        if (child.IsA("TextLabel")) txtLabels.set(getGuiKey(child), child);
        if (child.IsA("ImageLabel")) imgLabels.set(getGuiKey(child), child);
        if (child.IsA("Frame")) frames.set(getGuiKey(child), child);
    }
    guiElements = { txtButtons, imgButtons, txtLabels, imgLabels, frames };
    setUnlocked(player, guiElements);
    setBehaviors();
    return;
}


export function setupGui(player: Player, gui: ScreenGui) {
    playerGui = gui;
    findGuiElements(player, gui);
    return;
}




