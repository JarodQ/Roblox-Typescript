import { Players, Workspace, ReplicatedStorage } from "@rbxts/services";
import { PlayerGarden, Garden } from "../shared/Garden";

const interactEvent = ReplicatedStorage.WaitForChild("InteractEvent") as RemoteEvent;

const gardensFolder = Workspace.FindFirstChild("Gardens") as Folder | undefined
const PlayerGardens: Map<number, PlayerGarden> = new Map();
const assignedGardens: Map<number, Folder> = new Map();
//const assignedAllotments: Map<String, PlayerAllotment> = new Map();

const testKey: number = 100000001; //For testing!!!!!
assignedGardens.set(testKey, gardensFolder?.FindFirstChildOfClass("Folder") as Folder); //For testing!!!!!



function assignGarden(player: Player, gardensFolder: Folder) {
    const playerId = player.UserId;

    let gardensArray: Folder[] = [];
    for (const [, garden] of assignedGardens) {
        gardensArray.push(garden);
    }

    if (assignedGardens.has(player.UserId)) {
        // print("${player.Name} has already been assigned a garden!");
        return;
    }
    for (const garden of gardensFolder.GetChildren()) {
        if (!gardensArray.includes(garden as Folder)) {
            assignedGardens.set(playerId, garden as Folder);
            // print(`Garden assigned to ${player.Name} with Id: ${player.UserId}, has been assigned the garden: ${garden.Name}`);
            assignedGardens.forEach((value, key) => { //For Testing
                //print(`Key: ${key}, Value: ${value}`);

            })//For Testing
            // print(`Garden Folder: ${garden}`);
            return garden as Folder;
        }
    }
    // print("No available gardens to assign!");
    return;
}

function unassignGarden(player: Player) {
    const playerId = player.UserId;
    assignedGardens.delete(playerId)
    //print(`${playerId} has been removed from their garden.`);

}

Players.PlayerAdded.Connect(function (player: Player) {

    let assignedGarden: Folder | undefined;
    let allotmentsFolder: Folder | undefined;
    let allotments: Instance[] = [];

    if (gardensFolder) assignedGarden = assignGarden(player, gardensFolder);
    if (assignedGarden) {
        allotmentsFolder = assignedGarden.FindFirstChild("Allotments") as Folder;
    }
    if (allotmentsFolder) {
        for (let allotment of allotmentsFolder.GetChildren()) {
            allotments.push(allotment.FindFirstChildWhichIsA("Part") as Instance);
        }
    }
    //print(assignedGardens, allotmentsFolder, allotments.some(instance => instance !== undefined));
    //print(allotments);

    if (assignedGarden && allotmentsFolder && allotments.some(instance => instance !== undefined)) {
        //print("Creating New Garden");
        const newGarden = new PlayerGarden({
            owner: player,
            gardenFolder: assignedGarden,
            allotmentFolder: allotmentsFolder,
            allotments: allotments,
        })
        PlayerGardens.set(player.UserId, newGarden);
        newGarden.getOwner();
        newGarden.getAllotments();
    }
});

Players.PlayerRemoving.Connect(function (player: Player) {
    if (gardensFolder) unassignGarden(player);
})

interactEvent.OnServerEvent.Connect((player: Player, target: unknown, clickPosition: unknown, interactable?: unknown) => {
    const instance = target as Instance;
    const hitPos = clickPosition as Vector3;
    const playerGarden = PlayerGardens.get(player.UserId);
    if (instance && playerGarden) {
        const allotments: Instance[] = playerGarden.getAllotments();
        const allotment: Instance | undefined = allotments.find(value => value.Name === instance.Name);
        if (allotment && playerGarden.getOwner() === player) {
            playerGarden.onInteract(player, hitPos, allotment, interactable as Tool);
        }
        //print(`PlayerGarden: ${playerGarden}`);
    }
})
