import { ReplicatedStorage } from "@rbxts/services";
import { WeaponFlags, Loadouts, Loadout } from "Arena/shared/PlayerData/PlayerData";
import { WeaponSlot, WEAPON_SLOT_RULES } from "./loadoutRules";
import { WEAPON_IMAGES } from "./loadoutImages";
import { GuiElements } from "./guiManager";
const updatePlayerDataRemote = ReplicatedStorage.WaitForChild("updatePlayerDataRemote") as RemoteEvent;


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
        const loadoutName = instance.FindFirstChild("LoadoutName") as TextLabel;
        const slot1 = instance.FindFirstChild("primary");
        const slot2 = instance.FindFirstChild("secondary");
        const slot3 = instance.FindFirstChild("utility");
        const slot1Item = slot1?.FindFirstChildOfClass("ImageLabel");
        const slot2Item = slot2?.FindFirstChildOfClass("ImageLabel");
        const slot3Item = slot3?.FindFirstChildOfClass("ImageLabel");

        const currentLoadout = getGui(guiElements.txtLabels, "CurrentLoadout");
        const primarySelectFrame = getGui(guiElements.frames, "PrimarySelect");
        const secondarySelectFrame = getGui(guiElements.frames, "SecondarySelect");
        const utilitySelectFrame = getGui(guiElements.frames, "UtilitySelect");

        if (currentLoadout && loadoutName) {
            currentLoadout.SetAttribute("Loadout", instance.GetAttribute("Loadout"));
            currentLoadout.Text = loadoutName.Text;
        }

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
        print("Saving Changes to Player's Data!!!")
        const loadout = getGui(guiElements.txtLabels, "CurrentLoadout");
        const primarySelect = getGui(guiElements.frames, "PrimarySelect");
        const secondarySelect = getGui(guiElements.frames, "SecondarySelect");
        const utilitySelect = getGui(guiElements.frames, "UtilitySelect");
        const primaryAttribute = primarySelect?.GetAttribute("Weapon");
        const secondaryAttribute = secondarySelect?.GetAttribute("Weapon");
        const utilityAttribute = utilitySelect?.GetAttribute("Weapon");

        const loadoutName = loadout?.GetAttribute("Loadout");
        updatePlayerDataRemote.FireServer("loadouts", loadoutName, {
            name: "Close Quarters",
            weapons: {
                primary: primaryAttribute,
                secondary: secondaryAttribute,
                utility: utilityAttribute,
            },
        });
    },
    confirmLoadout(instance: Instance, guiElements: GuiElements) {

    },
    changeEquipment(instance: Instance, guiElements: GuiElements) {
        if (instance.Name === "PrimaryWeapon") {
            const primarySelect = getGui(guiElements.frames, "PrimarySelect");
            const imageLabel = primarySelect?.FindFirstChild("SelectLoadout")?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
            if (imageLabel) imageLabel.Image = instance.GetAttribute("WeaponImage") as string;
            if (primarySelect) primarySelect.SetAttribute("Weapon", instance.GetAttribute("Weapon") as string);
        }
        else if (instance.Name === "SecondaryWeapon") {
            const secondarySelect = getGui(guiElements.frames, "SecondarySelect");
            const imageLabel = secondarySelect?.FindFirstChild("SelectLoadout")?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
            if (imageLabel) imageLabel.Image = instance.GetAttribute("WeaponImage") as string;
            if (secondarySelect) secondarySelect.SetAttribute("Weapon", instance.GetAttribute("Weapon") as string);

        }
        else if (instance.Name === "UtilityWeapon") {
            const utilitySelect = getGui(guiElements.frames, "UtilitySelect");
            const imageLabel = utilitySelect?.FindFirstChild("SelectLoadout")?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
            if (imageLabel) imageLabel.Image = instance.GetAttribute("WeaponImage") as string;
            if (utilitySelect) utilitySelect.SetAttribute("Weapon", instance.GetAttribute("Weapon") as string);

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
    button.SetAttribute("Weapon", weapon);
    const imageLabel = button?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
    if (imageLabel) imageLabel.Image = WEAPON_IMAGES[weapon];
}

export function setLoadoutFrames(
    guiElements: GuiElements,
    unlockedWeapons: (keyof WeaponFlags)[],
    loadoutTuples: [keyof Loadouts, Loadout][] // ✅ not Loadouts
) {
    print("Setting Loadout Frames")
    const primaryFrame = getGui(guiElements.frames, "Primary");
    const secondaryFrame = getGui(guiElements.frames, "Secondary");
    const utilityFrame = getGui(guiElements.frames, "Utility");
    const buttonPREFAB = getGui(guiElements.txtButtons, "EquipmentButton");

    let loadoutSelector = getGui(guiElements.frames, "LoadoutSelector");
    loadoutSelector = loadoutSelector?.FindFirstChild("Selector") as Frame;

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

    const selectorFrames = loadoutSelector.GetChildren();
    if (!loadoutSelector) return;
    print("Loadouts", loadoutTuples);
    for (let i = 0; i < math.min(loadoutTuples.size(), selectorFrames.size()); i++) {
        const [loadoutKey, currentLoadout] = loadoutTuples[i];
        const frame = selectorFrames[i];

        const loadoutFrame = frame.FindFirstChild("SelectLoadout");
        const loadoutTxtLabel = frame.FindFirstChild("LoadoutName") as TextLabel;
        if (!loadoutFrame || !loadoutTxtLabel) continue;

        loadoutTxtLabel.Text = currentLoadout.name;

        for (const slot of loadoutFrame.GetChildren()) {
            const slotName = slot.Name;
            if (slotName === "primary" || slotName === "secondary" || slotName === "utility") {
                const equippedWeapon = currentLoadout.weapons[slotName as keyof typeof currentLoadout.weapons];
                const image = slot.FindFirstChild("Image") as ImageLabel;

                if (!image || !equippedWeapon || equippedWeapon === "") continue;

                const weaponImage = WEAPON_IMAGES[equippedWeapon as keyof WeaponFlags];
                image.Image = weaponImage;
            }
        }
    }
}
