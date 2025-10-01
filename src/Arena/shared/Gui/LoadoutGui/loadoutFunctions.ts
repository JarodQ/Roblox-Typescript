import { WeaponFlags } from "Arena/shared/PlayerData/PlayerData";
import { WeaponSlot, WEAPON_SLOT_RULES } from "./loadoutRules";
import { WEAPON_IMAGES } from "./loadoutImages";
import { GuiElements } from "./guiManager";


export function getGui<T extends GuiObject>(map: Map<string, T>, name: string): T | undefined {
    for (const [key, value] of map) {
        if (key.sub(-name.size() - 1) === "." + name) {
            return value;
        }
    }
    return undefined;
}

export const loadoutFunctions = {
    onLoadoutClicked(instance: Instance, guiElements: GuiElements) {
        print("Loadout Selected!");
        const slot1 = instance.FindFirstChild("Slot1");
        const slot2 = instance.FindFirstChild("Slot2");
        const slot3 = instance.FindFirstChild("Slot3");
        const slot1Item = slot1?.FindFirstChildOfClass("ImageLabel");
        const slot2Item = slot2?.FindFirstChildOfClass("ImageLabel");
        const slot3Item = slot3?.FindFirstChildOfClass("ImageLabel");

        const primarySelectFrame = getGui(guiElements.frames, "PrimarySelect");
        const secondarySelectFrame = getGui(guiElements.frames, "SecondarySelect");
        const utilitySelectFrame = getGui(guiElements.frames, "UtilitySelect");
        let tempVar;
        let tempImage;
        if (slot1Item) {
            tempVar = primarySelectFrame?.FindFirstChild("SelectLoadout")?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
            tempImage = slot1Item.Image;
            if (tempVar) tempVar.Visible = true;
            if (tempImage) { tempVar.Image = tempImage }
            else { tempVar.Image = "" };
        }

        if (slot2Item) {
            tempVar = secondarySelectFrame?.FindFirstChild("SelectLoadout")?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
            tempImage = slot2Item.Image;
            if (tempVar) tempVar.Visible = true;
            if (tempImage) { tempVar.Image = tempImage }
            else { tempVar.Image = "" };
        }
        if (slot3Item) {
            tempVar = utilitySelectFrame?.FindFirstChild("SelectLoadout")?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
            tempImage = slot3Item.Image;
            if (tempVar) tempVar.Visible = true;
            if (tempImage) { tempVar.Image = tempImage }
            else { tempVar.Image = "" };
        }

    },
    onPrimaryClicked(instance: Instance, guiElements: GuiElements) {
        print("Primary Weapon Slot Selected!");
        const primaryFrame = getGui(guiElements.frames, "Primary");
        const secondaryFrame = getGui(guiElements.frames, "Secondary");
        const utilityFrame = getGui(guiElements.frames, "Utility");
        if (primaryFrame) primaryFrame.Visible = true;
        if (secondaryFrame) secondaryFrame.Visible = false;
        if (utilityFrame) utilityFrame.Visible = false;
    },
    onSecondaryClicked(instance: Instance, guiElements: GuiElements) {
        print("Secondary Weapon selected!");
        const primaryFrame = getGui(guiElements.frames, "Primary");
        const secondaryFrame = getGui(guiElements.frames, "Secondary");
        const utilityFrame = getGui(guiElements.frames, "Utility");
        if (primaryFrame) primaryFrame.Visible = false;
        if (secondaryFrame) secondaryFrame.Visible = true;
        if (utilityFrame) utilityFrame.Visible = false;
    },
    onUtilityClicked(instance: Instance, guiElements: GuiElements) {
        print("Utility Selected!");
        const primaryFrame = getGui(guiElements.frames, "Primary");
        const secondaryFrame = getGui(guiElements.frames, "Secondary");
        const utilityFrame = getGui(guiElements.frames, "Utility");
        if (primaryFrame) primaryFrame.Visible = false;
        if (secondaryFrame) secondaryFrame.Visible = false;
        if (utilityFrame) utilityFrame.Visible = true;
    },
    swapPrimary(instance: Instance, guiElements: GuiElements) {
        print("Open Buy Store!");

    },
    swapSecondary(instance: Instance, guiElements: GuiElements) {
        print("Open Sell Store!");

    },
    swapUtility(instance: Instance, guiElements: GuiElements) {
        print("Open VIP Store!");

    },
    saveChanges(instance: Instance, guiElements: GuiElements) {

    },
    confirmLoadout(instance: Instance, guiElements: GuiElements) {

    },
    changeEquipment(instance: Instance, guiElements: GuiElements) {
        if (instance.Name === "PrimaryWeapon") {
            const primarySelect = getGui(guiElements.frames, "PrimarySelect");
            const imageLabel = primarySelect?.FindFirstChild("SelectLoadout")?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
            if (imageLabel) imageLabel.Image = instance.GetAttribute("WeaponImage") as string;
        }
        else if (instance.Name === "SecondaryWeapon") {
            const secondarySelect = getGui(guiElements.frames, "SecondarySelect");
            const imageLabel = secondarySelect?.FindFirstChild("SelectLoadout")?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
            if (imageLabel) imageLabel.Image = instance.GetAttribute("WeaponImage") as string;
        }
        else if (instance.Name === "UtilityWeapon") {
            const utilitySelect = getGui(guiElements.frames, "UtilitySelect");
            const imageLabel = utilitySelect?.FindFirstChild("SelectLoadout")?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
            if (imageLabel) imageLabel.Image = instance.GetAttribute("WeaponImage") as string;
        }

    }
}

function addWeaponOption(frame: Frame, slot: number, buttonPREFAB: GuiButton, weapon: (keyof WeaponFlags)) {
    const image = WEAPON_IMAGES[weapon];
    print(`Adding Weapon: ${weapon} Option to : ${frame} and setting Image ${image}`);

    const button = buttonPREFAB.Clone();
    button.Name = frame.Name + "Weapon";
    button.Parent = frame;
    button.Visible = true;
    button.SetAttribute("Behavior", frame.Name + "Weapon");
    button.SetAttribute("WeaponImage", WEAPON_IMAGES[weapon])
    const imageLabel = button?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
    if (imageLabel) imageLabel.Image = WEAPON_IMAGES[weapon];
}

export function setLoadoutFrames(guiElements: GuiElements, unlockedWeapons: (keyof WeaponFlags)[]) {
    print("Setting Loadout Frames")
    const primaryFrame = getGui(guiElements.frames, "Primary");
    const secondaryFrame = getGui(guiElements.frames, "Secondary");
    const utilityFrame = getGui(guiElements.frames, "Utility");
    const buttonPREFAB = getGui(guiElements.txtButtons, "EquipmentButton");

    let primarySlots = 1;
    let secondarySlots = 1;
    let utilitySlots = 1;
    for (const weapon of unlockedWeapons) {
        const slots = WEAPON_SLOT_RULES[weapon];
        print(`iterating over unlocked weapons.\n Slots: ${slots}`);
        print(!primaryFrame, !buttonPREFAB)
        if (!slots) continue;

        if (slots.includes("primary")) {
            if (!primaryFrame || !buttonPREFAB) return;
            addWeaponOption(primaryFrame, primarySlots, buttonPREFAB, weapon);
            primarySlots++;
        }
        if (slots.includes("secondary")) {
            if (!secondaryFrame || !buttonPREFAB) return;
            addWeaponOption(secondaryFrame, secondarySlots, buttonPREFAB, weapon);
            secondarySlots++;
        }
        if (slots.includes("utility")) {
            if (!utilityFrame || !buttonPREFAB) return;
            addWeaponOption(utilityFrame, utilitySlots, buttonPREFAB, weapon);
            utilitySlots++;
        }
    }
}
