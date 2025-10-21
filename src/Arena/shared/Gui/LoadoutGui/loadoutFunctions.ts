import { ReplicatedStorage } from "@rbxts/services";
import { WeaponFlags, Loadout, Loadouts, WeaponAssignments } from "Common/shared/PlayerData/PlayerData";
import { WeaponSlot, WEAPON_SLOT_RULES } from "./loadoutRules";
import { WEAPON_IMAGES } from "./loadoutImages";
import { GuiElements } from "./guiManager";
const loadLoadoutRemote = ReplicatedStorage.WaitForChild("loadLoadoutRemote") as RemoteEvent;
const updatePlayerDataRemote = ReplicatedStorage.WaitForChild("updatePlayerDataRemote") as RemoteEvent;


export function getGui<T extends GuiObject>(map: Map<string, T>, name: string): T | undefined {
    for (const [key, value] of map) {
        if (key.sub(-name.size() - 1) === "." + name) {
            return value;
        }
    }
    return undefined;
}

let myLoadouts: Loadouts;
export const loadoutFunctions = {
    loadLoadouts(guiElements: GuiElements) {
        loadLoadoutRemote.OnClientEvent.Connect((playerLoadouts, loadouts: [keyof Loadouts, Loadout][]) => {
            const selectorFrame = getGui(guiElements.frames, "Selector");
            myLoadouts = playerLoadouts;
            print("Loadouts: ", myLoadouts)
            if (!selectorFrame) return;
            for (const frame of selectorFrame?.GetChildren() ?? []) {
                print("Frame: ", frame.IsA("Frame"))
                if (frame.IsA("Frame")) {
                    const entry = loadouts.find(([key]) => key === frame.Name);
                    print("entry: ", entry)
                    if (entry) {
                        const [key, currentLoadout] = entry;
                        const loadoutButton = frame?.FindFirstChild("SelectLoadout");
                        if (!loadoutButton) continue;
                        const validSlots: (keyof WeaponAssignments)[] = ["primary", "secondary", "utility"];

                        for (const currentFrame of loadoutButton.GetChildren()) {
                            if (!currentFrame.IsA("Frame")) continue;

                            const slotName = currentFrame.Name;
                            if (!validSlots.includes(slotName as keyof WeaponAssignments)) continue;

                            const equippedWeapon = currentLoadout.weapons[slotName as keyof WeaponAssignments];
                            const currentImage = currentFrame.FindFirstChild("Image") as ImageLabel;

                            if (!currentImage || !equippedWeapon || equippedWeapon === "") continue;

                            const weaponImage = WEAPON_IMAGES[equippedWeapon as keyof typeof WEAPON_IMAGES];
                            currentImage.Image = weaponImage;
                            currentFrame.SetAttribute("Weapon", equippedWeapon);
                        }
                    }
                }
            }
        });
        loadLoadoutRemote.FireServer();

    },
    onLoadoutClicked(instance: Instance, guiElements: GuiElements) {
        //Need to get info from playerdata
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

        let selectImage;
        let loadoutImage;
        if (slot1Item) {
            selectImage = primarySelectFrame?.FindFirstChild("SelectLoadout")?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
            loadoutImage = slot1Item.Image;
            primarySelectFrame?.SetAttribute("Weapon", slot1?.GetAttribute("Weapon"));
            if (selectImage) selectImage.Visible = true;
            if (loadoutImage) { selectImage.Image = loadoutImage }
            else { selectImage.Image = "" };
        }

        if (slot2Item) {
            selectImage = secondarySelectFrame?.FindFirstChild("SelectLoadout")?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
            loadoutImage = slot2Item.Image;
            secondarySelectFrame?.SetAttribute("Weapon", slot2?.GetAttribute("Weapon"));
            if (selectImage) selectImage.Visible = true;
            if (loadoutImage) { selectImage.Image = loadoutImage }
            else { selectImage.Image = "" };
        }
        if (slot3Item) {
            selectImage = utilitySelectFrame?.FindFirstChild("SelectLoadout")?.FindFirstChild("Item")?.FindFirstChild("ImageLabel") as ImageLabel;
            loadoutImage = slot3Item.Image;
            utilitySelectFrame?.SetAttribute("Weapon", slot3?.GetAttribute("Weapon"));
            if (selectImage) selectImage.Visible = true;
            if (loadoutImage) { selectImage.Image = loadoutImage }
            else { selectImage.Image = "" };
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
        const loadoutSelector = getGui(guiElements.frames, 'Selector');
        const primarySelect = getGui(guiElements.frames, "PrimarySelect");
        const secondarySelect = getGui(guiElements.frames, "SecondarySelect");
        const utilitySelect = getGui(guiElements.frames, "UtilitySelect");
        const primaryAttribute = primarySelect?.GetAttribute("Weapon");
        const secondaryAttribute = secondarySelect?.GetAttribute("Weapon");
        const utilityAttribute = utilitySelect?.GetAttribute("Weapon");

        //update loadouts and playerdata
        const loadoutName = loadout?.GetAttribute("Loadout") as string;
        const currentLoadoutFrame = loadoutSelector?.FindFirstChild(loadoutName);
        const selectLoadout = currentLoadoutFrame?.FindFirstChild("SelectLoadout");
        if (selectLoadout) {
            const primaryFrame = selectLoadout?.FindFirstChild("primary");
            const primaryImage = primaryFrame?.FindFirstChild("Image") as ImageLabel;
            const secondaryFrame = selectLoadout?.FindFirstChild("secondary");
            const secondaryImage = secondaryFrame?.FindFirstChild("Image") as ImageLabel;
            const utiltyFrame = selectLoadout?.FindFirstChild("utility");
            const utiltyImage = utiltyFrame?.FindFirstChild("Image") as ImageLabel;
            if (primaryFrame && secondaryFrame && utiltyFrame && primaryImage && secondaryImage && utiltyImage) {
                print("attributes: ", primaryAttribute, secondaryAttribute, utilityAttribute)
                if (primaryAttribute !== "") {
                    primaryFrame.SetAttribute("Weapon", primaryAttribute);
                    primaryImage.Image = WEAPON_IMAGES[primaryAttribute as keyof WeaponFlags];

                }
                if (secondaryAttribute !== "") {
                    secondaryFrame.SetAttribute("Weapon", secondaryAttribute);
                    secondaryImage.Image = WEAPON_IMAGES[secondaryAttribute as keyof WeaponFlags];
                }
                if (utilityAttribute !== "") {
                    utiltyFrame.SetAttribute("Weapon", utilityAttribute);
                    utiltyImage.Image = WEAPON_IMAGES[utilityAttribute as keyof WeaponFlags];
                }
            }
        }
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
        print("Change Equipment Called");
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
