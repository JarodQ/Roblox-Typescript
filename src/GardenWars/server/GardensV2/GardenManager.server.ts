import { Players, Workspace, ReplicatedStorage } from "@rbxts/services";
import { PlayerGarden } from "./PlayerGarden";
import { getPREFAB } from "GardenWars/shared/PREFABS";
import { Profiles } from "Common/server/Data/DataManager";
import { TestSeed1 } from "../Gardens/Plants";
import { activePlants } from "./GardenService";

const teleportToGarden = ReplicatedStorage.WaitForChild("TeleportToGarden") as RemoteEvent;
const requestGardenEvent = ReplicatedStorage.WaitForChild("RequestGardenEvent") as RemoteFunction;
const initializePlayerGarden = ReplicatedStorage.WaitForChild("InitializePlayerGarden") as RemoteEvent;
const allotmentStateChange = ReplicatedStorage.WaitForChild("AllotmentStateChange") as RemoteEvent;
// const allotmentStateChange = ReplicatedStorage.WaitForChild("AllotmentStateChange") as RemoteEvent;

const gardensFolder = Workspace.FindFirstChild("Gardens") as Folder | undefined
export const PlayerGardens: Map<number, PlayerGarden> = new Map();
const assignedGardens: Map<number, Folder> = new Map();

// const testKey: number = 100000001; //For testing!!!!!
// assignedGardens.set(testKey, gardensFolder?.FindFirstChildOfClass("Folder") as Folder); //For testing!!!!!

function assignGarden(player: Player, gardensFolder: Folder) {
    const playerId = player.UserId;
    let gardensArray: Folder[] = [];
    for (const [, garden] of assignedGardens) {
        gardensArray.push(garden);
    }
    for (const garden of gardensFolder.GetChildren()) {
        if (!gardensArray.includes(garden as Folder)) {
            assignedGardens.set(playerId, garden as Folder);
            return garden as Folder;
        }
    }
    return;
}

function unassignGarden(player: Player) {
    const playerId = player.UserId;
    assignedGardens.delete(playerId)
}

teleportToGarden.OnServerEvent.Connect((player: Player) => {
    const playerGarden = assignedGardens.get(player.UserId);
    if (!playerGarden) return;

    const teleportFolder = playerGarden.FindFirstChild("Teleport") as Folder;
    if (!teleportFolder) return;

    const teleportPart = teleportFolder.FindFirstChild("TeleportPart") as BasePart;
    if (!teleportPart) return;

    const character = player.Character ?? player.CharacterAdded.Wait()[0];
    if (!character) return;

    const root = character.FindFirstChild("HumanoidRootPart") as BasePart;
    if (!root) return;

    // Teleport the character slightly above the part to avoid clipping
    root.CFrame = teleportPart.CFrame.add(new Vector3(0, 3, 0));
});

requestGardenEvent.OnServerInvoke = (player: Player): PlayerGarden | undefined => {
    return PlayerGardens.get(player.UserId);
}

Players.PlayerAdded.Connect(function (player: Player) {

    let assignedGarden: Folder | undefined;
    let allotmentsFolder: Model | undefined;
    let allotments: Model[] = [];

    if (gardensFolder) assignedGarden = assignGarden(player, gardensFolder);
    if (assignedGarden) {
        const gardenRoot = assignedGarden.WaitForChild("Root") as Part;
        const allotmentsPREFAB = getPREFAB("Allotments", "Allotments") as Model;
        print("Allotment found: ", allotmentsPREFAB)
        if (allotmentsPREFAB) {
            allotmentsFolder = allotmentsPREFAB.Clone();
            allotmentsFolder.Parent = assignedGarden;
            const offset = new Vector3(0, 2, 0);
            allotmentsFolder.PivotTo(gardenRoot.CFrame.add(offset));

        }

        allotmentsFolder = assignedGarden.FindFirstChild("Allotments") as Model
        print("Before final if")
        // if (assignedGarden && allotmentsFolder && allotments.some(model => model !== undefined)) {
        if (assignedGarden && allotmentsFolder) {

            print("In final if")
            const newGarden = new PlayerGarden({
                owner: player,
                gardenFolder: assignedGarden,
                allotmentFolder: allotmentsFolder,
                allotments: allotments,
            })
            PlayerGardens.set(player.UserId, newGarden);
            initializePlayerGarden.FireAllClients(newGarden.getAllotmentFolder())

            reassignGrownPlants(player, assignedGarden);
            // initializePlayerGarden.FireAllClients(newGarden.getAllotmentFolder())
        }
    }
});

Players.PlayerRemoving.Connect(function (player: Player) {
    if (gardensFolder) unassignGarden(player);
})

export function reassignGrownPlants(player: Player, garden: Folder) {
    print("reassigning gardens");
    wait(5);

    const profile = Profiles.get(player);
    if (!profile) return;

    print("Profile found. Replanting seeds in progress");
    const allotments = garden.FindFirstChild("Allotments") as Model;
    if (!allotments) return;

    for (let i = 0; i < profile.Data.Plants.size(); i++) {
        const plantData = profile.Data.Plants[i];
        const allotment = allotments.FindFirstChild(plantData.allotmentIndex) as Model;
        const rootPart = allotment?.FindFirstChild("Root") as Part;
        if (!allotment || !rootPart) continue;

        const PREFABList = getPREFAB("seeds", plantData.plantId) as Part[];
        const progressBar = getPREFAB("UI", "ProgressBar") as BillboardGui[];

        if (!PREFABList || !progressBar || PREFABList.size() === 0 || progressBar.size() === 0) {
            warn(`Missing prefab or progress bar for plantId: ${plantData.plantId}`);
            continue;
        }

        // const definedSeed: Seed = {
        //     name: plantData.plantId,
        //     PREFABS: PREFABList,
        //     rarity: plantData.rarity,
        //     level: plantData.level,
        // };

        // 🌱 Spawn coroutine for each plant
        const plant = new TestSeed1(allotment, plantData);
        task.spawn(() => {
            plant.plant(player, rootPart.Position, () => {
                allotment.SetAttribute("State", "grown");
                allotmentStateChange.FireAllClients(allotment.Name, "grown");
            });
        });
        if (plant.getGrown()) {
            allotment.SetAttribute("State", "grown");
        }
        else {
            allotment.SetAttribute("State", "growing");
        }
        activePlants.set(allotment, plant);
        allotmentStateChange.FireAllClients(allotment.Name, allotment.GetAttribute("State"));
    }
}


