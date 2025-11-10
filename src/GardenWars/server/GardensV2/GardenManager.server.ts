import { Players, Workspace, ReplicatedStorage } from "@rbxts/services";
import { PlayerGarden } from "./PlayerGarden";
import { getPREFAB } from "GardenWars/shared/PREFABS";

const requestGardenEvent = new Instance("RemoteFunction");
requestGardenEvent.Name = "RequestGardenEvent";
requestGardenEvent.Parent = ReplicatedStorage;

const initializePlayerGarden = new Instance("RemoteEvent");
initializePlayerGarden.Name = "InitializePlayerGarden";
initializePlayerGarden.Parent = ReplicatedStorage;

const teleportToGarden = new Instance("RemoteEvent");
teleportToGarden.Name = "TeleportToGarden";
teleportToGarden.Parent = ReplicatedStorage;

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
    }
    if (allotmentsFolder) {
        for (let allotment of allotmentsFolder.GetChildren()) {
            allotments.push(allotment as Model);
        }
    }
    print("Before final if")
    if (assignedGarden && allotmentsFolder && allotments.some(model => model !== undefined)) {
        print("In final if")
        const newGarden = new PlayerGarden({
            owner: player,
            gardenFolder: assignedGarden,
            allotmentFolder: allotmentsFolder,
            allotments: allotments,
        })
        PlayerGardens.set(player.UserId, newGarden);
        initializePlayerGarden.FireAllClients(newGarden.getAllotmentFolder())
    }
});

Players.PlayerRemoving.Connect(function (player: Player) {
    if (gardensFolder) unassignGarden(player);
})

