import { ReplicatedStorage, Workspace } from "@rbxts/services";
import * as PREFABS from "./PREFABS";
import * as InteractInterface from "./InteractInterface"
import { Harvestable } from "./InteractInterface";



const DropsPrefabsFolder = ReplicatedStorage.FindFirstChild("PREFABS")!.FindFirstChild("Drops")!;

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
    private plantPart: Part | Model | undefined;
    private seedPosition: Vector3 = new Vector3(0, 0, 0);
    private seedProgress: BillboardGui;
    private growthStage: number = 0;
    private growthRate: number = 1;
    private growthStart: number = 1;
    private currentStageTime: number = 1;
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

    public plant(position: Vector3): void {
        this.plantPart = this.seed.PREFABS.find((part) => part.Name === "Stage0")?.Clone();
        if (!this.plantPart) {
            print("Plant PREFAB could not be found!");
            return;
        }
        this.plantPart.Parent = Workspace;
        //this.plantPart.Position = position;
        print(`Moving ${this.plantPart} to position: ${position}`);
        InteractInterface.moveInstance(this.plantPart, position);
        this.seedPosition = position;
        this.growthStart = DateTime.now().UnixTimestampMillis;
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
        print(this.seed.name)
        let plantPrefab: Model | Part = PREFABS.getPREFAB("Drops", this.seed.name) as Model | Part
        print(plantPrefab)
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
        print("Harvesting Plant");
        InteractInterface.tweenArcPop(player, this.seed.name, plantPosition, plantPrefab);
        this.grown = false
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
            InteractInterface.moveInstance(newPlantPart, this.seedPosition);
            this.seedProgress.Parent = newPlantPart;
            this.plantPart.Destroy();
            this.plantPart = newPlantPart;
            if (!this.seed.PREFABS[this.growthStage + 1]) {
                InteractInterface.InteractionRegistry.register(this.plantPart, this);
            }
        }
    }

    private trackGrowth(): void {
        const progressBar: Frame = this.seedProgress.GetDescendants().find(d => d.Name === "ProgressBar" && d.IsA("Frame")) as Frame;
        const progress = new UDim2(-1, 0, 0, 0);
        let trackTime: number = DateTime.now().UnixTimestampMillis;
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
