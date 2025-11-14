import { ReplicatedStorage } from "@rbxts/services";
import { PlayerTemplate, templateData, PlantData } from "./Template";
import ProfileStore from "@rbxts/profile-store";
import { PlantInfoDictionary } from "GardenWars/server/GardensV2/PlantInfo";

// RemoteEvents
const updateGold = ReplicatedStorage.WaitForChild("UpdateGold") as RemoteEvent;
const updateValor = ReplicatedStorage.WaitForChild("UpdateValor") as RemoteEvent;

// Create a type alias for the resolved profile
const DummyStore = ProfileStore.New<PlayerTemplate>("Dummy", templateData);
export type PlayerProfile = Awaited<ReturnType<typeof DummyStore.StartSessionAsync>>;

export const Profiles = new Map<Player, PlayerProfile>();

export const DataManager = {

    AddGold(player: Player, amount: number) {
        const profile = Profiles.get(player);
        if (!profile) return;

        profile.Data.Gold += amount;

        const goldStat = player.FindFirstChild("leaderstats")?.FindFirstChild("Gold") as NumberValue;
        if (goldStat) goldStat.Value = profile.Data.Gold;

        updateGold.FireClient(player, profile.Data.Gold);
    },

    AddValor(player: Player, amount: number) {
        const profile = Profiles.get(player);
        if (!profile) return;

        profile.Data.Valor += amount;

        const valorStat = player.FindFirstChild("leaderstats")?.FindFirstChild("Valor") as NumberValue;
        if (valorStat) valorStat.Value = profile.Data.Valor;

        updateValor.FireClient(player, profile.Data.Valor);
    },

    AddPlant(player: Player, plant: PlantData) {
        const profile = Profiles.get(player);
        if (!profile) return;
        profile.Data.Plants.push(plant);
    },

    RemovePlant(player: Player, plant: PlantData) {
        const profile = Profiles.get(player);
        if (!profile) return;
        const index = profile.Data.Plants.findIndex(p => p.allotmentIndex === plant.allotmentIndex);
        if (index === -1) {
            print("Plant not found in GrownPlants");
            return;
        }

        profile.Data.Plants.remove(index);
    },

    UpdatePlant(player: Player, allotmentIndex: string, updates: Partial<PlantData>) {
        const profile = Profiles.get(player);
        if (!profile) return;

        const plant = profile.Data.Plants.find(p => p.allotmentIndex === allotmentIndex);
        if (!plant) return;

        for (const [key, value] of pairs(updates)) {
            if (value !== undefined) {
                (plant as any)[key] = value;
            }
        }
    },

    LevelUpPlant(player: Player, allotmentIndex: string, plantData: PlantData) {
        const profile = Profiles.get(player);
        if (!profile) return;

        const plant = profile.Data.Plants.find(p => p.allotmentIndex === allotmentIndex);
        if (!plant) return;

        const cost = PlantInfoDictionary.getLevelUpCost(plant.plantId, plant.rarity, plant.level);
        print("profile gold: ", profile.Data.Gold, " upgradecost: ", cost)
        if (profile.Data.Gold >= cost) {
            plant.level += 1;
            this.AddGold(player, -1 * cost);
        }

    },

    CollectPassiveIncome(player: Player, plant: PlantData) {
        const profile = Profiles.get(player);
        if (!profile) return;

        const now = os.time();
        const grownAt = plant.plantedAt + plant.growthDuration;

        if (now < grownAt) {
            print(`Plant ${plant.plantId} is not fully grown yet.`);
            return;
        }

        const incomeStart = math.max(grownAt, plant.lastCollectedAt ?? grownAt);
        const elapsed = now - incomeStart;
        const rate = PlantInfoDictionary.getIncomeRate(plant.plantId, plant.rarity, plant.level);
        const income = math.floor(elapsed * rate);

        if (income <= 0) {
            print(`No income to collect from ${plant.plantId}.`);
            return;
        }

        // Award gold and update collection timestamp
        this.AddGold(player, income)
        plant.lastCollectedAt = now;

        print(`Collected $${income} from ${plant.plantId}. Total gold: ${profile.Data.Gold}`);
    }


};

export default DataManager;

