type GuiElements = {
    txtButtons: Map<string, TextButton>;
    imgButtons: Map<string, ImageButton>;
    txtLabels: Map<string, TextLabel>;
    imgLabels: Map<string, ImageLabel>;
    frames: Map<string, Frame>;
}

let guiElements: GuiElements;
let playerGui: ScreenGui;

function getGui<T extends GuiObject>(map: Map<string, T>, name: string): T | undefined {
    for (const [key, value] of map) {
        if (key.sub(-name.size() - 1) === "." + name) {
            return value;
        }
    }
    return undefined;
}

function getGuiKey(instance: Instance): string {
    return instance.GetFullName();
}

function withDebounce<T extends (...args: unknown[]) => void>(fn: T, delay = 0.3): T {
    let lastClick = 0;
    return ((...args: unknown[]) => {
        const now = tick();
        if (now - lastClick >= delay) {
            lastClick = now;
            print("⏱ Debounced function firing with args:", args);
            fn(...args);
        }
    }) as T;
}

function onBuyClicked(instance: Instance) {
    print("Buy button clicked");
}
function onSellClicked(instance: Instance) {
    print("Sell button clicked!");
}
function onCloseClicked(instance: Instance) {
    print("Close Button clicked!");
}
function onRobuxBuy(instance: Instance) {
    print("Buy with Robux clicked!");
}
function onOpenBuy(instance: Instance) {
    print("Open Buy Store!");
    const vipFrame = getGui(guiElements.frames, "VIPFrame");
    const buyFrame = getGui(guiElements.frames, "BuyFrame");
    const sellFrame = getGui(guiElements.frames, "SellFrame");
    if (vipFrame) vipFrame.Visible = false;
    if (buyFrame) buyFrame.Visible = true;
    if (sellFrame) sellFrame.Visible = false;
}
function onOpenSell(instance: Instance) {
    print("Open Sell Store!");
    const vipFrame = getGui(guiElements.frames, "VIPFrame");
    const buyFrame = getGui(guiElements.frames, "BuyFrame");
    const sellFrame = getGui(guiElements.frames, "SellFrame");
    if (vipFrame) vipFrame.Visible = false;
    if (buyFrame) buyFrame.Visible = false;
    if (sellFrame) sellFrame.Visible = true;
}
function onOpenVIP(instance: Instance) {
    print("Open VIP Store!");
    const vipFrame = getGui(guiElements.frames, "VIPFrame");
    const buyFrame = getGui(guiElements.frames, "BuyFrame");
    const sellFrame = getGui(guiElements.frames, "SellFrame");
    if (vipFrame) vipFrame.Visible = true;
    if (buyFrame) buyFrame.Visible = false;
    if (sellFrame) sellFrame.Visible = false;
}

const buttonBehaviors: Record<string, (instance: Instance) => void> = {
    Buy: onBuyClicked,
    Sell: onSellClicked,
    CloseButton: onCloseClicked,
    RobuxBuy: onRobuxBuy,
    OpenBuy: onOpenBuy,
    OpenSell: onOpenSell,
    OpenVIP: onOpenVIP,
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
        print(`Checking ${name} (${guiType}) → behavior:`, behavior);
        if (behavior) {
            if (instance.IsA("TextButton") || instance.IsA("ImageButton")) {
                print(`✅ Connecting ${name} to behavior`);
                instance.MouseButton1Click.Connect(withDebounce(() => {
                    print(`🔥 ${name} clicked`);
                    print("Calling behavior with:", instance.GetFullName());
                    behavior(instance);
                }));
            }
            else if (instance.IsA("TextLabel") || instance.IsA("ImageLabel")) {
                print("Is an image. Cannot interact");
            }
            if (!behaviorKey) {
                print(`⚠️ No Behavior attribute found on ${instance.GetFullName()}`);
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
    print(guiElements);
    setBehaviors();
    return;
}

export function setupGui(gui: ScreenGui) {
    playerGui = gui;
    findGuiElements(gui);
    return;
}




