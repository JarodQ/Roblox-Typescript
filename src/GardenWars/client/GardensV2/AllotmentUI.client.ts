import { Players, ReplicatedStorage, Workspace } from '@rbxts/services';
import { getOptionsForAllotment } from 'GardenWars/shared/GardensV2/PlantingSystem';
import { AllotmentState } from 'GardenWars/shared/GardensV2/PlantingSystem';
import { getPREFAB } from 'GardenWars/shared/PREFABS';

const player = Players.LocalPlayer;
const allotmentAction = ReplicatedStorage.WaitForChild("AllotmentAction") as RemoteEvent;
const allotmentStateChange = ReplicatedStorage.WaitForChild("AllotmentStateChange") as RemoteEvent;
const gardenFolder = Workspace.WaitForChild("Gardens").WaitForChild("Garden1") as Folder;
const interactEvent = ReplicatedStorage.WaitForChild("InteractEvent") as RemoteEvent;
const collectIncome = ReplicatedStorage.WaitForChild("CollectIncome") as RemoteEvent;
const getPassiveIncome = ReplicatedStorage.WaitForChild("GetPassiveIncome") as RemoteFunction


function createPrompt(option: string, parent: Part, allotmentId: string, isFirst: boolean) {
    const prompt = new Instance("ProximityPrompt");
    prompt.ActionText = option;
    prompt.ObjectText = "Allotment";
    prompt.HoldDuration = 0;
    prompt.RequiresLineOfSight = false;
    prompt.Exclusivity = Enum.ProximityPromptExclusivity.AlwaysShow;
    prompt.Name = `Prompt_${option}`;

    if (isFirst) {
        prompt.UIOffset = new Vector2(0, 50);
    }

    prompt.Parent = parent;

    prompt.Triggered.Connect(() => {
        allotmentAction.FireServer(allotmentId, option);
    });
}

function setupCollectPad(allotment: Model) {
    const collectPad = allotment.FindFirstChild("Collect");
    if (!collectPad || !collectPad.IsA("BasePart")) return;

    let display = collectPad.FindFirstChild("IncomeDisplay") as BillboardGui;
    if (!display) {
        display = new Instance("BillboardGui");
        display.Name = "IncomeDisplay";
        display.Size = new UDim2(0, 200, 0, 50);
        display.Adornee = collectPad;
        display.AlwaysOnTop = true;
        display.Parent = collectPad;

        const label = new Instance("TextLabel");
        label.Name = "TextLabel";
        label.Size = new UDim2(1, 0, 1, 0);
        label.BackgroundTransparency = 1;
        label.TextColor3 = new Color3(1, 1, 0);
        label.TextScaled = true;
        label.Text = "Income: $0";
        label.Parent = display;
    }

    // ✅ Per-character debounce
    const activeCharacters = new Set<Model>();

    collectPad.Touched.Connect((hit) => {
        const character = hit.FindFirstAncestorOfClass("Model");
        if (!character || !character.IsA("Model")) return;

        if (activeCharacters.has(character)) return;

        const player = Players.GetPlayerFromCharacter(character);
        if (!player) return;
        print(player, " is touching the pad!")

        const gardenOwner = allotment.FindFirstAncestorOfClass("Folder")?.GetAttribute("OwnerUserId") as number;
        if (player.UserId !== gardenOwner) return;
        print("GardenOwner: ", player, " is touching the pad!")
        activeCharacters.add(character);
        collectIncome.FireServer(allotment.Name);
        updateIncomeDisplayForAllotment(allotment)
    });

    collectPad.TouchEnded.Connect((hit) => {
        const character = hit.FindFirstAncestorOfClass("Model");
        if (!character || !character.IsA("Model")) return;

        // Remove only if no parts of the character are still touching
        const stillTouching = collectPad.GetTouchingParts().some((part) => part.IsDescendantOf(character));
        if (!stillTouching) {
            activeCharacters.delete(character);
        }
    });

}

function clearOldPrompts(model: Part) {
    for (const child of model.GetChildren()) {
        if (child.IsA("ProximityPrompt")) {
            child.Destroy();
        }
    }
}

function updatePromptsForAllotment(allotment: Model) {
    const state = allotment.GetAttribute("State") as AllotmentState;
    const ownerUserId = allotment.Parent?.GetAttribute("OwnerUserId") as number;
    const options = getOptionsForAllotment({ ownerUserId, state }, player.UserId);
    const rootPart = allotment.WaitForChild("Root") as Part;
    if (!rootPart) return;
    clearOldPrompts(rootPart);

    options.forEach((option, index) => {
        createPrompt(option, rootPart, allotment.Name, index === 0);
    });
    updateInfoPlateButton(allotment, state);
}

const buttonConnections = new Map<TextButton, RBXScriptConnection>();

function updateInfoPlateButton(allotment: Model, state: AllotmentState) {
    const infoPlate = allotment.FindFirstChild("InfoPlate");
    if (!infoPlate || !infoPlate.IsA("BasePart")) return;

    const surfaceGui = infoPlate.FindFirstChild("SurfaceGui");
    if (!surfaceGui || !surfaceGui.IsA("SurfaceGui")) return;

    const textButton = surfaceGui.FindFirstChild("TextButton");
    if (!textButton || !textButton.IsA("TextButton")) return;

    const ownerUserId = allotment.Parent?.GetAttribute("OwnerUserId") as number;
    const options = getOptionsForAllotment({ ownerUserId, state }, Players.LocalPlayer.UserId);

    if (options.size() === 0) {
        textButton.Visible = false;
        return;
    }

    const primaryOption = options[0];
    textButton.Visible = true;
    textButton.Text = primaryOption === "Sell" ? "$8.93k" : primaryOption;

    // Disconnect previous connection if it exists
    const existing = buttonConnections.get(textButton);
    if (existing) {
        existing.Disconnect();
    }

    // Connect new action
    const connection = textButton.Activated.Connect(() => {
        const allotmentAction = ReplicatedStorage.WaitForChild("AllotmentAction") as RemoteEvent;
        allotmentAction.FireServer(allotment.Name, primaryOption);
    });

    buttonConnections.set(textButton, connection);
}




// Initial setup
gardenFolder.GetDescendants().forEach((descendant) => {
    if (descendant.IsA("Model") && descendant.Name === "Allotment") {
        updatePromptsForAllotment(descendant);
        setupCollectPad(descendant)
    }
});

gardenFolder.DescendantAdded.Connect((descendant) => {
    if (descendant.IsA("Model") && descendant.Name === "Allotment") {
        descendant.GetAttributeChangedSignal("State").Connect(() => {
            print("Signal received of changed attribute")
            updatePromptsForAllotment(descendant);
        });
    }
});


allotmentStateChange.OnClientEvent.Connect((allotmentId: string, newState: AllotmentState) => {
    const allotment = gardenFolder.FindFirstChild(allotmentId) as Model;
    print("Event received from client for: ", allotment)
    if (allotment) {
        allotment.SetAttribute("State", newState); // triggers UI refresh if you're listening to attribute changes
        updatePromptsForAllotment(allotment);
    }
});

function updateIncomeDisplayForAllotment(allotment: Model) {
    if (!allotment.IsA("Model") || allotment.Name !== "Allotment") return;

    const collectPad = allotment.FindFirstChild("Collect");
    if (!collectPad || !collectPad.IsA("BasePart")) return;

    const gui = collectPad.FindFirstChild("IncomeDisplay") as BillboardGui;
    const label = gui?.FindFirstChild("TextLabel") as TextLabel;
    if (!label) return;

    const income = getPassiveIncome.InvokeServer(allotment) as number;
    label.Text = `Income: $${income}`;
}


function startIncomeUpdater() {
    const updateInterval = 1; // seconds

    task.spawn(() => {
        while (true) {
            for (const child of gardenFolder.GetChildren()) {
                if (child.IsA("Model") && child.Name === "Allotment") {
                    updateIncomeDisplayForAllotment(child); // ✅ child is now typed as Model
                }
            }


            wait(updateInterval);
        }
    });
}

startIncomeUpdater();



