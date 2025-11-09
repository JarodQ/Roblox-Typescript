import { Players, ReplicatedStorage, Workspace } from '@rbxts/services';
import { AllotmentState } from 'GardenWars/shared/GardensV2/PlantingSystem';
import { transitionState } from 'GardenWars/shared/GardensV2/PlantingSystem';
import { getPREFAB } from 'GardenWars/shared/PREFABS';
import { TestSeed1 } from '../Gardens/Plants';
import { PlantMaster, Seed } from '../Gardens/Plants';
import DataManager, { Profiles } from 'Common/server/Data/DataManager';
import { getIncomeRate } from './IncomeRates';
import { PlantRarity } from 'Common/server/Data/Template';
import { GrownPlantData } from 'Common/server/Data/Template';

const gardenFolder = Workspace.WaitForChild('Gardens') as Folder;
const allotmentAction = new Instance('RemoteEvent');
allotmentAction.Name = 'AllotmentAction';
allotmentAction.Parent = ReplicatedStorage;

const allotmentStateChange = new Instance('RemoteEvent');
allotmentStateChange.Name = 'AllotmentStateChange';
allotmentStateChange.Parent = ReplicatedStorage;

const collectIncome = new Instance('RemoteEvent');
collectIncome.Name = 'CollectIncome';
collectIncome.Parent = ReplicatedStorage;

const getPassiveIncome = new Instance('RemoteFunction');
getPassiveIncome.Name = 'GetPassiveIncome';
getPassiveIncome.Parent = ReplicatedStorage;

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
        DataManager.UpdatePlant(player, getAllotmentIndex(allotment), {
            plantedAt: os.time() - plant.getGrowthDuration(),
            lastCollectedAt: os.time()
        })
    }
    else if (state === "growing" && action === "Discard") {
        const plant = activePlants.get(allotment);
        if (!plant) {
            warn(`No active plant found for allotment ${allotment.Name}`);
            return;
        }
        plant.discardPlant(player)
        activePlants.delete(allotment)
        const plantData = getPlantFromAllotment(player, allotment)
        if (plantData) {
            DataManager.CollectPassiveIncome(player, plantData)
            DataManager.RemovePlant(player, plantData)
        }
        allotment.SetAttribute("State", "empty");
    }
    else if (state === "grown" && action === "Harvest") {
        const plant = activePlants.get(allotment);
        if (!plant) {
            warn(`No active plant found for allotment ${allotment.Name}`);
            return;
        }

        plant.harvest(player);
        activePlants.delete(allotment)
        const allotmentIndex = getAllotmentIndex(allotment)
        const plantData = getPlantFromAllotment(player, allotment)
        if (plantData) {
            DataManager.CollectPassiveIncome(player, plantData)
            DataManager.RemovePlant(player, plantData)
            allotment.SetAttribute("State", "empty");
        }
    }


    allotmentStateChange.FireAllClients(allotment.Name, allotment.GetAttribute("State"));


});

collectIncome.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
    const [allotmentId] = args as [string]
    const garden = gardenAssignments.get(player.UserId);
    if (!garden) return;
    print("Garden found: ", garden)
    const allotment = garden.FindFirstChild(allotmentId) as Model;
    if (!allotment) return;
    print("allotment found: ", allotment)
    const plant = getPlantFromAllotment(player, allotment)
    if (!plant) return;

    print("plant found: ", plant)

    DataManager.CollectPassiveIncome(player, plant)

})

getPassiveIncome.OnServerInvoke = (player: Player, ...args: unknown[]): number => {
    const [allotment] = args as [Model];
    const profile = Profiles.get(player);
    if (!profile || !allotment) return 0;

    const plant = profile.Data.GrownPlants.find(p => p.allotmentIndex === getAllotmentIndex(allotment));
    if (!plant) return 0;

    const now = os.time();
    const grownAt = plant.plantedAt + plant.growthDuration;
    if (now < grownAt) return 0;

    const incomeStart = math.max(grownAt, plant.lastCollectedAt ?? grownAt);
    const elapsed = now - incomeStart;
    const rate = getIncomeRate(plant.plantId, plant.rarity, plant.level);
    return math.floor(elapsed * rate);
};



function serializePlant(plant: PlantMaster, allotmentIndex: number): GrownPlantData {
    return {
        plantId: plant.seed.name,
        allotmentIndex,
        plantedAt: plant.getPlantedAt(),
        growthDuration: plant.getGrowthDuration(),
        rarity: plant.seed.rarity,
        level: plant.seed.level,
        lastCollectedAt: os.time(), // optional: set to now on planting
    };
}

function getAllotmentIndex(allotment: Model): number {
    const parent = allotment.Parent;
    if (!parent) return -1;

    const allotments = parent.GetChildren().filter((c) => c.IsA("Model") && c.Name === "Allotment");
    return allotments.indexOf(allotment);
}

function getPlantFromAllotment(player: Player, allotmentId: Model): GrownPlantData | undefined {
    const profile = Profiles.get(player);
    if (!profile) return;

    const index = getAllotmentIndex(allotmentId);
    return profile.Data.GrownPlants.find(p => p.allotmentIndex === index);
}


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
        rarity: allotment.GetAttribute("Rarity") as PlantRarity,
        level: allotment.GetAttribute("Level") as number,
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
    DataManager.AddPlant(player, serializePlant(plant, getAllotmentIndex(allotment)))


    return true;
}



export function reassignGrownPlants(player: Player, garden: Folder) {
    const profile = Profiles.get(player);
    if (!profile) return;

    const allotments = garden.GetChildren().filter((c) => c.IsA("Model") && c.Name === "Allotment");

    for (let i = 0; i < profile.Data.GrownPlants.size(); i++) {
        const plantData = profile.Data.GrownPlants[i];
        const allotment = allotments[i] as Model;
        const rootPart = allotment.FindFirstChild("RootPart") as Part;
        if (!allotment || !rootPart) continue;

        allotment.SetAttribute("State", "grown");
        allotment.SetAttribute("PlantId", plantData.plantId);

        const PREFABList = getPREFAB("seeds", plantData.plantId) as Part[];
        const progressBar = getPREFAB("UI", "ProgressBar") as BillboardGui[];

        if (!PREFABList || !progressBar || PREFABList.size() === 0 || progressBar.size() === 0) {
            warn(`Missing prefab or progress bar for plantId: ${plantData.plantId}`);
            continue;
        }

        const definedSeed: Seed = {
            name: plantData.plantId,
            PREFABS: PREFABList,
            plantProgress: progressBar[0],
            rarity: plantData.rarity,
            level: plantData.level
        };

        const plant = new TestSeed1(definedSeed);
        plant.plant(player, rootPart.Position, true);
        activePlants.set(allotment, plant);
    }

}


