import { shopFunctions } from "GardenWars/shared/Shop/shopFunctions";

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

function findGuiElements(container: Instance) {
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
    setBehaviors();
    return;
}

export function setupGui(gui: ScreenGui) {
    playerGui = gui;
    findGuiElements(gui);
    return;
}




