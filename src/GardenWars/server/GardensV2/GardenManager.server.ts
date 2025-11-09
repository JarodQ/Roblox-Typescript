import { Players, ReplicatedStorage, Workspace } from '@rbxts/services';
import { AllotmentState } from 'GardenWars/shared/GardensV2/PlantingSystem';
import { transitionState } from 'GardenWars/shared/GardensV2/PlantingSystem';
import { getPREFAB } from 'GardenWars/shared/PREFABS';
import { TestSeed1 } from '../Gardens/Plants';
import { PlantMaster } from '../Gardens/Plants';

const gardenFolder = Workspace.WaitForChild('Gardens') as Folder;
const allotmentAction = new Instance('RemoteEvent');
allotmentAction.Name = 'AllotmentAction';
allotmentAction.Parent = ReplicatedStorage;

const allotmentStateChange = new Instance('RemoteEvent');
allotmentStateChange.Name = 'AllotmentStateChange';
allotmentStateChange.Parent = ReplicatedStorage;

const gardenAssignments = new Map<number, Folder>();
const activePlants = new Map<Model, PlantMaster>();

Players.PlayerAdded.Connect((player) => {
    const gardens = gardenFolder.GetChildren().filter((g) => g.IsA('Folder'));
    const unassigned = gardens.filter((g) => !gardenAssignments.has(g.GetAttribute('OwnerUserId') as number));

    const garden = unassigned[0];

    if (garden) {
        garden.SetAttribute('OwnerUserId', player.UserId);
        gardenAssignments.set(player.UserId, garden);
    }
});

allotmentAction.OnServerEvent.Connect((player, ...args: unknown[]) => {
    const [allotmentId, action] = args as [string, string];

    const garden = gardenAssignments.get(player.UserId);
    if (!garden) return;

    const allotment = garden.FindFirstChild(allotmentId) as Model;
    if (!allotment) return;

    const state = allotment.GetAttribute("State") as AllotmentState;
    const ownerUserId = garden.GetAttribute("OwnerUserId") as number;

    const newState = transitionState(
        { ownerUserId, state },
        action,
        player.UserId
    );

    // allotment.SetAttribute("State", newState.state);

    // 🔔 Notify all clients of the updated state

    if (state === "empty" && action === "Plant") {
        const tool = player.Character?.FindFirstChildWhichIsA("Tool") as Tool;
        if (!tool) {
            warn(`No tool equipped by ${player.Name}, cannot plant.`);
            return;
        }
        const seedPlanted = plantSeedAtAllotment(player, allotment, tool.Name);
        if (seedPlanted) {
            allotment.SetAttribute("State", newState.state);
        }
    }
    else if (state === "growing" && action === "Grow Instantly") {
        const plant = activePlants.get(allotment);
        if (!plant) {
            warn(`No active plant found for allotment ${allotment.Name}`);
            return;
        }

        plant.forceGrow(() => {
            allotment.SetAttribute("State", "grown");
            allotmentStateChange.FireAllClients(allotment.Name, "grown");
        });
    }
    else if (state === "grown" && action === "Harvest") {
        const plant = activePlants.get(allotment);
        if (!plant) {
            warn(`No active plant found for allotment ${allotment.Name}`);
            return;
        }

        plant.harvest(player);
        activePlants.delete(allotment);

        allotment.SetAttribute("State", "empty");
        allotmentStateChange.FireAllClients(allotment.Name, "empty");
    }


    allotmentStateChange.FireAllClients(allotment.Name, allotment.GetAttribute("State"));


});

function plantSeedAtAllotment(player: Player, allotment: Model, seedName: string): boolean {
    const rootPart = allotment.FindFirstChild("Root") as Part;
    if (!rootPart) return false;

    const prefabList = getPREFAB("seeds", seedName) as Part[];
    const progressBars = getPREFAB("UI", "ProgressBar") as BillboardGui[];

    if (!prefabList || !progressBars || prefabList.size() === 0 || progressBars.size() === 0) {
        warn(`Missing prefab or progress bar for seed: ${seedName}`);
        return false;
    }

    const seed = {
        name: seedName,
        PREFABS: prefabList,
        plantProgress: progressBars[0],
    };

    const plant = new TestSeed1(seed);
    activePlants.set(allotment, plant);
    const plantingCoro = coroutine.create(() => {
        plant.plant(player, rootPart.Position, false, () => {
            allotment.SetAttribute("State", "grown");
            allotmentStateChange.FireAllClients(allotment.Name, "grown");
        });
    });
    coroutine.resume(plantingCoro);


    return true;
}



