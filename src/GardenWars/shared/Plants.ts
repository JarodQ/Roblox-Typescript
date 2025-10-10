import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { Players } from "@rbxts/services";
import * as PREFABS from "./PREFABS";
// import * as InteractInterface from "./InteractInterface"
import { Harvestable, moveInstance, tweenArcPop, InteractionRegistry } from "./InteractInterface";
import { addPlantData, removePlantData, playerCache } from "Common/shared/PlayerData/PlayerDataService";
import { loadPlayerData } from "Common/shared/PlayerData/DataStoreWrapper";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";
import { serializeVector3, serializeCFrame, deserializeVector3, deserializeCFrame } from "Common/shared/PlayerData/Utils/Serialize";



const DropsPrefabsFolder = ReplicatedStorage.FindFirstChild("PREFABS")!.FindFirstChild("Drops")!;

// function getGrowthStage(plantedAt: number, totalGrowthTime: number, stageGrowthTime: number): number {
//     const now = DateTime.now().UnixTimestampMillis;
//     const elapsed = now - (plantedAt * 1000); // convert seconds to ms
//     if (elapsed >= totalGrowthTime) return numberOfStages; // fully grown
//     return math.floor(elapsed / stageGrowthTime);
// }
Players.PlayerAdded.Connect(async (player) => {
    let data: PlayerData | undefined;
    let attempts = 0;

    // Wait up to 2 seconds (20 attempts at 0.1s)
    while (!data && attempts < 20) {
        data = playerCache.get(player.UserId);
        if (!data) {
            await Promise.delay(0.1);
            attempts++;
        }
    }

    if (data) {
        replantSavedPlants(player, data);
    } else {
        warn(`Player data not found in cache for ${player.Name}`);
    }
});

export function replantSavedPlants(player: Player, data: PlayerData) {
    for (const plant of data.plants) {
        const position = deserializeVector3(plant.position);
        const orientation = deserializeCFrame(plant.position, plant.rotation);

        // Get prefab list and progress bar like onInteract
        const PREFABList = PREFABS.getPREFAB("seeds", plant.plantId) as Part[];
        const progressBar = PREFABS.getPREFAB("UI", "ProgressBar") as BillboardGui[];

        if (!PREFABList || !progressBar || PREFABList.size() === 0 || progressBar.size() === 0) {
            warn(`Missing prefab or progress bar for plantId: ${plant.plantId}`);
            continue;
        }

        const definedSeed: Seed = {
            name: plant.plantId,
            PREFABS: PREFABList,
            plantProgress: progressBar[0],
        };

        const replantedSeed = new TestSeed1(definedSeed);
        replantedSeed.seedPosition = position;
        replantedSeed.seedOrientation = orientation.Position; // orientation is full CFrame
        replantedSeed.growthStart = plant.plantedAt * 1000; // convert seconds to ms
        replantedSeed.currentStageTime = plant.plantedAt * 1000;
        print("Replanting from saved data!")
        replantedSeed.plant(player, position, true);
    }
}

export function isSeed(obj: unknown): obj is Seed {
    if (!obj || !typeIs(obj, "Instance")) return false;
    return "name" in obj && "PREFAB" in obj;
}
export type Seed = {
    name: string;
    PREFABS: (Part | Model)[];
    plantProgress: BillboardGui;
}

export type SeedMods = {
    seedType: string;
    day: Boolean
    night: Boolean;
    wet: Boolean;
    charged: Boolean;
    haste: Boolean
    fireAspect: Boolean;
}

export class PlantMaster implements Harvestable {
    public seed: Seed;
    public seedPosition: Vector3 = new Vector3(0, 0, 0);
    public seedOrientation: Vector3 = new Vector3(0, 0, 0);
    public growthStart: number | undefined = undefined;
    public currentStageTime: number = 1;
    private plantPart: Part | Model | undefined;
    private seedProgress: BillboardGui;
    private growthStage: number = 0;
    private growthRate: number = 1;
    private stageGrowthTime: number;
    private totalGrowthTime: number;
    private grown: boolean;


    constructor(seed: Seed) {
        this.seed = seed;
        this.seedProgress = this.seed.plantProgress;
        this.stageGrowthTime = 5 * this.growthRate * 1000; //*1000 -> Convert to milliseconds
        this.totalGrowthTime = 5 * this.growthRate * (this.seed.PREFABS.size() - 1) * 1000; //*1000 -> Convert to milliseconds
        this.grown = false;
    }

    public plant(owner: Player, position: Vector3, replanting: boolean): void {
        const character = owner.Character ?? owner.CharacterAdded.Wait()[0];
        const root = character?.FindFirstChild("HumanoidRootPart") as Part | undefined;
        let orientation = new Vector3(0, 0, 0);;
        if (root) {
            orientation = root.Orientation;
        }
        this.growthStage = this.computeGrowthStage();
        const stageName = `Stage${this.growthStage}`;
        this.plantPart = this.seed.PREFABS.find((part) => part.Name === stageName)?.Clone();
        if (this.plantPart && this.growthStage >= this.seed.PREFABS.size() - 1) {
            this.grown = true;
            InteractionRegistry.register(this.plantPart, this);
            // return;
        }

        if (!this.plantPart) {
            print("Plant PREFAB could not be found!");
            return;
        }
        this.plantPart.Parent = Workspace;
        //this.plantPart.Position = position;
        //Add Plant to player Data
        // Store position and orientation
        this.seedPosition = position;
        if (orientation) this.seedOrientation = orientation;

        // Add plant to player data (serialized)
        if (!replanting) {
            addPlantData(owner, {
                plantId: this.seed.name,
                position: serializeVector3(this.seedPosition),
                rotation: serializeCFrame(new CFrame(this.seedOrientation)),
                plantedAt: os.time(),
            });
        }


        moveInstance(this.plantPart, position, orientation);
        if (orientation) this.seedOrientation = orientation
        if (!this.growthStart) this.growthStart = DateTime.now().UnixTimestampMillis;
        this.currentStageTime = DateTime.now().UnixTimestampMillis;
        this.seedProgress = this.seedProgress.Clone();
        this.seedProgress.Parent = this.plantPart;
        this.setStageProgressBars();
        this.trackGrowth();
        return;
    }

    public canInteract(player: Player) {
        return this.grown;
    }

    public onInteract(player: Player) {
        if (this.isReadyToHarvest()) {
            //if (this.plantPart) this.plantPart.Destroy();
            this.harvest(player);
        }
    }

    public isReadyToHarvest(): boolean {
        return this.grown;
    }

    public harvest(player: Player) {
        //const plantPrefab = DropsPrefabsFolder.FindFirstChild("HarvestTest")!.Clone() as BasePart;
        let plantPrefab: Model | Part = PREFABS.getPREFAB("Drops", this.seed.name) as Model | Part
        plantPrefab = plantPrefab.Clone();
        let plantPosition: Vector3;
        if (this.plantPart?.IsA("Model")) {
            plantPosition = this.plantPart?.GetPivot().Position
        } else if (this.plantPart?.IsA("BasePart")) {
            plantPosition = this.plantPart?.Position;
        } else {
            return;
        }
        plantPrefab.Parent = Workspace;
        //plantPrefab.Size = new Vector3(1, 1, 1);
        this.plantPart?.Destroy();
        removePlantData(player, this.seedPosition);
        print("Harvesting Plant");
        tweenArcPop(player, this.seed.name, plantPosition, plantPrefab);
        this.grown = false
    }

    private computeGrowthStage(): number {
        if (!this.growthStart) return 0;
        const now = DateTime.now().UnixTimestampMillis;
        const elapsed = now - this.growthStart;
        if (elapsed >= this.totalGrowthTime) return this.seed.PREFABS.size() - 1;
        return math.floor(elapsed / this.stageGrowthTime);
    }

    private evolveGrowth() {

        if (this.plantPart) {
            this.growthStage++;
            //const newPlantPart = this.seed.PREFABS[this.growthStage].Clone();
            const newPlantPart = this.seed.PREFABS.find((part) => part.Name === `Stage${this.growthStage}`)?.Clone();
            if (!newPlantPart) {
                print("Plant PREFAB could not be found!");
                return;
            }
            newPlantPart.Parent = Workspace;
            moveInstance(newPlantPart, this.seedPosition, this.seedOrientation);
            this.seedProgress.Parent = newPlantPart;
            this.plantPart.Destroy();
            this.plantPart = newPlantPart;
            if (!this.seed.PREFABS[this.growthStage + 1]) {
                InteractionRegistry.register(this.plantPart, this);
            }
        }
    }

    private trackGrowth(): void {
        print("Tracking growth or plant!")
        const progressBar: Frame = this.seedProgress.GetDescendants().find(d => d.Name === "ProgressBar" && d.IsA("Frame")) as Frame;
        const progress = new UDim2(-1, 0, 0, 0);
        if (!this.growthStart) this.growthStart = DateTime.now().UnixTimestampMillis;
        do {
            const deltaTime = DateTime.now().UnixTimestampMillis - this.growthStart;
            let progress = new UDim2(math.clamp(-1 + deltaTime / this.totalGrowthTime, -1, 0), 0, 0, 0);
            progressBar.Position = progress;
            if (DateTime.now().UnixTimestampMillis - this.currentStageTime >= this.stageGrowthTime) {
                this.currentStageTime = DateTime.now().UnixTimestampMillis;
                const trackGrowthCoro = coroutine.create(() => { this.evolveGrowth() })
                coroutine.resume(trackGrowthCoro);
            }
            wait();
        } while (DateTime.now().UnixTimestampMillis - this.growthStart <= this.totalGrowthTime);
        const trackGrowthCoro = coroutine.create(() => { this.evolveGrowth() })
        coroutine.resume(trackGrowthCoro);
        this.grown = true;
    }

    private setStageProgressBars() {
        const stagesFolder = this.seedProgress.GetDescendants().find(d => d.Name === "Stages" && d.IsA("Folder")) as Folder;
        const numOfStages: number = this.seed.PREFABS.size() - 1;
        for (let i: number = 1; i < numOfStages; i++) {
            const imageLabel: ImageLabel = new Instance("ImageLabel");
            imageLabel.Parent = stagesFolder;
            imageLabel.Name = "Stage" + tostring(i);
            imageLabel.BackgroundTransparency = 1;
            imageLabel.Size = new UDim2(0.02, 0, 1, 0);
            imageLabel.Image = "rbxassetid://111929381933851";
            imageLabel.ImageColor3 = new Color3(0, 0, 0);
            imageLabel.ZIndex = 3;
            imageLabel.Position = new UDim2(1 / numOfStages * i, 0, 0, 0)
        }
    }
}

export class TestSeed1 extends PlantMaster {
    seedType: String = "TestSeed1";
    wet: Boolean = true;
    charged: Boolean = false;
    haste: Boolean = false
    fireAspect: Boolean = false;
}
