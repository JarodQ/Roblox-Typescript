import { Players, Workspace } from "@rbxts/services";

const gardensFolder = Workspace.FindFirstChild("Gardens") as Folder | undefined
const assignedGardens: Map<number, Folder> = new Map();

function assignGarden(player: Player, gardensFolder: Folder) {
    const playerId = player.UserId;

    let gardensArray: Folder[] = [];
    for (const [, garden] of assignedGardens) {
        gardensArray.push(garden);
    }

    if (assignedGardens.has(player.UserId)) {
        print("${player.Name} has already been assigned a garden!");
        return;
    }
    for (const garden of gardensFolder.GetChildren()) {
        if (!gardensArray.includes(garden as Folder)) {
            assignedGardens.set(playerId, garden as Folder);
            print(`${player.Name} with Id: ${player.UserId}, has been assigned the garden: ${garden.Name}`);
            return;
        }
    }
    print("No available gardens to assign!");
}


type Garden = {
    owner: string;
    allotments: Instance[];
}

class PlayerGarden {
    private garden: Garden;

    constructor(garden: Garden) {
        this.garden = garden;
    }

    public getOwner(): String {
        return this.garden.owner;
    }

    public getAllotments(): object[] {
        return this.garden.allotments
    }
}

Players.PlayerAdded.Connect(function (player: Player) {



    const newGarden = new PlayerGarden({
        owner: player.Name,
        allotments: gardensFolder?.GetChildren() ?? []
    })
    //print(newGarden.getOwner());
    //print(newGarden.getAllotments());
    if (gardensFolder) assignGarden(player, gardensFolder);

});