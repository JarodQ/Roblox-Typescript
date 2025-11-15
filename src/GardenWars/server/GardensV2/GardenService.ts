import { Players, ReplicatedStorage, Workspace } from '@rbxts/services';
import { AllotmentState } from 'GardenWars/shared/GardensV2/PlantingSystem';
import { transitionState } from 'GardenWars/shared/GardensV2/PlantingSystem';
import { getPREFAB } from 'GardenWars/shared/PREFABS';
import { TestSeed1 } from '../Gardens/Plants';
import { PlantMaster } from '../Gardens/Plants';
import DataManager, { Profiles } from 'Common/server/Data/DataManager';
import { PlantId, PlantRarity } from 'Common/server/Data/Template';
import { PlantData } from 'Common/server/Data/Template';
import { PlantInfoDictionary } from './PlantInfo';

const gardenFolder = Workspace.WaitForChild('Gardens') as Folder;
const allotmentAction = ReplicatedStorage.WaitForChild("AllotmentAction") as RemoteEvent;
const allotmentStateChange = ReplicatedStorage.WaitForChild("AllotmentStateChange") as RemoteEvent;
const collectIncome = ReplicatedStorage.WaitForChild("CollectIncome") as RemoteEvent;
const getPassiveIncome = ReplicatedStorage.WaitForChild("GetPassiveIncome") as RemoteFunction;


const gardenAssignments = new Map<number, Folder>();
export const activePlants = new Map<Model, PlantMaster>();

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

    const allotments = garden.FindFirstChild("Allotments") as Model;
    const allotment = allotments.FindFirstChild(allotmentId) as Model;
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
        const seedPlanted = plantSeedAtAllotment(player, allotment, tool);
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
        DataManager.UpdatePlant(player, allotment.Name, {
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
    else if (state === "grown" && action === "Level Up") {
        const plant = activePlants.get(allotment);
        if (!plant) {
            warn(`No active plant found for allotment ${allotment.Name}`);
            return;
        }

        const profile = Profiles.get(player)
        const playerGold = profile?.Data.Gold;
        const upgradeCost = PlantInfoDictionary.getLevelUpCost(plant.plantData.plantId, plant.plantData.rarity, plant.plantData.level);
        print("Checking plantData: ", plant.allotmentModel.Name)
        if (plant.plantData && playerGold && playerGold >= upgradeCost) {
            plant.levelUp();
            DataManager.LevelUpPlant(player, plant.allotmentModel.Name, plant.plantData)
        }
    }


    allotmentStateChange.FireAllClients(allotment.Name, allotment.GetAttribute("State"));


});

collectIncome.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
    const [allotment] = args as [Model]
    const plant = getPlantFromAllotment(player, allotment)
    if (!plant) return;

    DataManager.CollectPassiveIncome(player, plant)

})

getPassiveIncome.OnServerInvoke = (player: Player, ...args: unknown[]): number => {
    const [allotment] = args as [Model];
    const profile = Profiles.get(player);
    if (!profile || !allotment) return 0;

    const plant = getPlantFromAllotment(player, allotment)
    if (!plant) return 0;
    const now = os.time();
    const grownAt = plant.plantedAt + plant.growthDuration;
    if (now < grownAt) return 0;

    const incomeStart = math.max(grownAt, plant.lastCollectedAt ?? grownAt);
    const elapsed = now - incomeStart;
    const rate = PlantInfoDictionary.getIncomeRate(plant.plantId, plant.rarity, plant.level);
    return math.floor(elapsed * rate);
};



// function serializePlant(plant: PlantMaster, allotmentIndex: string): PlantData {
//     return {
//         plantId: plant.seed.name,
//         allotmentIndex,
//         plantedAt: plant.getPlantedAt(),
//         growthDuration: plant.getGrowthDuration(),
//         rarity: plant.seed.rarity,
//         level: plant.seed.level,
//         lastCollectedAt: os.time(), // optional: set to now on planting
//     };
// }

function getAllotmentIndex(allotment: Model): number {
    const parent = allotment.Parent;
    if (!parent) return -1;

    const allotments = parent.GetChildren().filter((c) => c.IsA("Model") && c.Name === "Allotment");
    return allotments.indexOf(allotment);
}

function getPlantFromAllotment(player: Player, allotment: Model): PlantData | undefined {
    const profile = Profiles.get(player);
    if (!profile) return;

    return profile.Data.Plants.find(p => p.allotmentIndex === allotment.Name);
}


function plantSeedAtAllotment(player: Player, allotment: Model, tool: Tool): boolean {
    const rootPart = allotment.FindFirstChild("Root") as Part;
    const plantId = tool.GetAttribute("plantId") as string;
    const seedName = tool.GetAttribute("plantName") as string;
    const plantRarity = tool.GetAttribute("PlantRarity") as PlantRarity; // 👈 read rarity from tool
    if (!rootPart) return false;

    const prefabList = getPREFAB("seeds", plantId) as Part[];
    const progressBars = getPREFAB("UI", "ProgressBar") as BillboardGui[];

    if (!prefabList || !progressBars || prefabList.size() === 0 || progressBars.size() === 0) {
        warn(`Missing prefab or progress bar for seed: ${plantId}`);
        return false;
    }

    const plantData = {
        plantId: plantId as PlantId,
        plantName: seedName,
        allotmentIndex: allotment.Name,
        plantedAt: os.time(),
        growthDuration: 1,
        rarity: plantRarity, // 👈 use the tool’s rarity
        level: 0,
        lastCollected: os.time(),
    };

    const plant = new TestSeed1(allotment, plantData);
    activePlants.set(allotment, plant);
    const plantingCoro = coroutine.create(() => {
        plant.plant(player, rootPart.Position, () => {
            allotment.SetAttribute("State", "grown");
            allotmentStateChange.FireAllClients(allotment.Name, "grown");
        });
    });
    coroutine.resume(plantingCoro);
    DataManager.AddPlant(player, plantData);

    return true;
}







