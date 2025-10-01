import { ReplicatedStorage } from "@rbxts/services";
import { loadoutFunctions, setLoadoutFrames } from "./loadoutFunctions";
const getLoadoutDataRemote = ReplicatedStorage.WaitForChild("getLoadoutDataRemote") as RemoteEvent;
import { Loadout, Loadouts, WeaponFlags } from "Arena/shared/PlayerData/PlayerData";


export type GuiElements = {
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
    Loadout: (instance: Instance) => loadoutFunctions.onLoadoutClicked(instance, guiElements),
    Primary: (instance: Instance) => loadoutFunctions.onPrimaryClicked(instance, guiElements),
    Secondary: (instance: Instance) => loadoutFunctions.onSecondaryClicked(instance, guiElements),
    Utility: (instance: Instance) => loadoutFunctions.onUtilityClicked(instance, guiElements),
    SwapPrimary: (instance: Instance) => loadoutFunctions.swapPrimary(instance, guiElements),
    SwapSecondary: (instance: Instance) => loadoutFunctions.swapSecondary(instance, guiElements),
    SwapUtility: (instance: Instance) => loadoutFunctions.swapUtility(instance, guiElements),
    SaveChanges: (instance: Instance) => loadoutFunctions.saveChanges(instance, guiElements),
    ConfirmLoadout: (instance: Instance) => loadoutFunctions.confirmLoadout(instance, guiElements),
    PrimaryWeapon: (instance: Instance) => loadoutFunctions.changeEquipment(instance, guiElements),
    SecondaryWeapon: (instance: Instance) => loadoutFunctions.changeEquipment(instance, guiElements),
    UtilityWeapon: (instance: Instance) => loadoutFunctions.changeEquipment(instance, guiElements),
}

function forEachGuiElement(
    callBack: (guiType: string, name: string, instance: GuiObject) => void,
) {
    for (const [name, instance] of guiElements.txtButtons) callBack("TextButton", name, instance);
    for (const [name, instance] of guiElements.imgButtons) callBack("ImageButton", name, instance);
    // for (const [name, instance] of guiElements.txtLabels) callBack("TextLabel", name, instance);
    // for (const [name, instance] of guiElements.imgLabels) callBack("ImageLabel", name, instance);
    // for (const [name, instance] of guiElements.frames) callBack("Frame", name, instance);
}

function setBehaviors() {
    forEachGuiElement((guiType, name, instance) => {
        // Only process TextButton and ImageButton
        if (!(instance.IsA("TextButton") || instance.IsA("ImageButton"))) return;

        const behaviorKey = instance.GetAttribute("Behavior") as string | undefined;
        const behavior = behaviorKey ? buttonBehaviors[behaviorKey] : undefined;

        if (!behavior) return;

        // Prevent duplicate connections
        const alreadyConnected = instance.GetAttribute("BehaviorConnected") as boolean | undefined;
        if (alreadyConnected) return;

        // Connect behavior
        instance.MouseButton1Click.Connect(withDebounce(() => {
            behavior(instance);
        }));

        // Mark as connected
        instance.SetAttribute("BehaviorConnected", true);
    });
}

function addGuiElements(container: Instance): GuiElements {
    const txtButtons = new Map<string, TextButton>();
    const imgButtons = new Map<string, ImageButton>();
    const txtLabels = new Map<string, TextLabel>();
    const imgLabels = new Map<string, ImageLabel>();
    const frames = new Map<string, Frame>();

    for (const child of container.GetDescendants()) {
        const key = getGuiKey(child);

        if (child.IsA("TextButton") && !txtButtons.has(key)) txtButtons.set(key, child);
        if (child.IsA("ImageButton") && !imgButtons.has(key)) imgButtons.set(key, child);
        if (child.IsA("TextLabel") && !txtLabels.has(key)) txtLabels.set(key, child);
        if (child.IsA("ImageLabel") && !imgLabels.has(key)) imgLabels.set(key, child);
        if (child.IsA("Frame") && !frames.has(key)) frames.set(key, child);
    }
    guiElements = { txtButtons, imgButtons, txtLabels, imgLabels, frames };
    setBehaviors();
    return guiElements;
}

export async function setupGui(gui: ScreenGui) {
    playerGui = gui;
    let guiElements = addGuiElements(gui);

    getLoadoutDataRemote.OnClientEvent.Connect((unlockedWeapons: (keyof WeaponFlags)[], loadouts: [keyof Loadouts, Loadout][]) => {
        print("🔓 Unlocked weapons:", unlockedWeapons);
        setLoadoutFrames(guiElements, unlockedWeapons, loadouts);
        addGuiElements(gui);
    });

    getLoadoutDataRemote.FireServer(); // Request data
    guiElements = addGuiElements(gui);

}




