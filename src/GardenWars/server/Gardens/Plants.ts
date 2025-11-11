import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { Players } from "@rbxts/services";
import * as PREFABS from "../../shared/PREFABS";
import { moveInstance, tweenArcPop } from "../../shared/Gardens/VisualUtils";
import { Interactable, InteractionRegistry } from "GardenWars/shared/InteractInterface";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";
import { serializeVector3, serializeCFrame, deserializeVector3, deserializeCFrame } from "Common/shared/PlayerData/Utils/Serialize";
import { PlantData, PlantRarity } from "Common/server/Data/Template";

const DropsPrefabsFolder = ReplicatedStorage.FindFirstChild("PREFABS")!.FindFirstChild("Drops")!;
const plantProgressPREFABs = PREFABS.getPREFAB("UI", "PlantInfo") as BillboardGui[];
const plantProgressPREFAB = plantProgressPREFABs[0] as BillboardGui;

export interface Harvestable extends Interactable {
    isReadyToHarvest(): boolean;
    harvest(player: Player): void;
}

Players.PlayerAdded.Connect(async (player) => {
});


export class PlantMaster implements Harvestable {
    public plantData: PlantData
    public seedPosition: Vector3 = new Vector3(0, 0, 0);
    public seedOrientation: Vector3 = new Vector3(0, 0, 0);
    public currentStageTime: number = 1;
    private plantPREFABS: Part[];
    private plantPart: Part | Model | undefined;
    private plantInfoGui: BillboardGui
    private seedProgress: Frame;
    private growthStage: number = 0;
    private growthRate: number = 1;
    private stageGrowthTime: number;
    private totalGrowthTime: number;
    private grown: boolean;
    private cancelGrowth = false;


    constructor(plantData: PlantData) {
        // this.seed = seed;
        this.plantPREFABS = PREFABS.getPREFAB("seeds", plantData.plantId) as Part[];
        // this.seed.rarity = seed.rarity ?? "Common";
        // this.seed.level = seed.level ?? 1;
        // this.seedProgress = this.seed.plantProgress;
        this.plantInfoGui = plantProgressPREFAB
        this.seedProgress = plantProgressPREFAB.FindFirstChild("Frame")?.FindFirstChild("ProgressBar") as Frame;
        print("Progress Bar: ", this.seedProgress)
        this.stageGrowthTime = 5 * this.growthRate; // seconds
        this.totalGrowthTime = 5 * this.growthRate * (this.plantPREFABS.size() - 1); // seconds
        this.grown = false;
        this.plantData = plantData;
    }

    public getPlantedAt(): number {
        return this.plantData.plantedAt;
    }


    public getGrown(): boolean {
        return os.time() - this.plantData.plantedAt >= this.totalGrowthTime;
    }



    public getGrowthDuration(): number {
        return math.floor(this.totalGrowthTime);
    }

    public plant(owner: Player, position: Vector3, onFullyGrown?: () => void): void {
        // print(owner, position, replanting)
        const character = owner.Character ?? owner.CharacterAdded.Wait()[0];
        const root = character?.FindFirstChild("HumanoidRootPart") as Part | undefined;
        let orientation = new Vector3(0, 0, 0);;
        if (root) {
            orientation = root.Orientation;
        }
        this.growthStage = this.computeGrowthStage();
        const stageName = `Stage${this.growthStage}`;
        this.plantPart = this.plantPREFABS.find((part) => part.Name === stageName)?.Clone();
        if (this.plantPart && this.growthStage >= this.plantPREFABS.size() - 1) {
            this.grown = true;
            // return;
        }

        if (!this.plantPart) {
            return;
        }
        this.plantPart.Parent = Workspace;
        this.seedPosition = position;
        if (orientation) this.seedOrientation = orientation;


        moveInstance(this.plantPart, position, orientation);
        if (orientation) this.seedOrientation = orientation
        // if (!this.growthStart) this.growthStart = os.time();

        this.currentStageTime = os.time();
        this.plantInfoGui = this.plantInfoGui.Clone();
        this.plantInfoGui.Parent = this.plantPart.FindFirstChild("Root");
        this.seedProgress = this.plantInfoGui.GetDescendants().find(
            (d) => d.Name === "ProgressBar" && d.IsA("Frame")
        ) as Frame;
        this.setStageProgressBars();
        this.trackGrowth(onFullyGrown);
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

    public forceGrow(onFullyGrown?: () => void) {
        this.cancelGrowth = true;

        while (this.growthStage < this.plantPREFABS.size() - 1) {
            this.evolveGrowth();
            // this.growthStage++;
        }
        this.grown = true;

        const progressBar = this.seedProgress.GetDescendants().find(
            (d) => d.Name === "ProgressBar" && d.IsA("Frame")
        ) as Frame | undefined;

        if (progressBar) {
            progressBar.Position = new UDim2(0, 0, 0, 0);
        }

        if (onFullyGrown) {
            onFullyGrown();
        }
    }



    public harvest(player: Player) {
        const prefab = PREFABS.getPREFAB("Drops", this.plantData.plantId) as Model | Part;
        const plantPrefab = prefab.Clone();
        let plantPosition: Vector3;
        if (this.plantPart?.IsA("Model")) {
            plantPosition = this.plantPart.GetPivot().Position;
        } else if (this.plantPart?.IsA("BasePart")) {
            plantPosition = this.plantPart.Position;
        } else {
            return;
        }

        // Destroy the server-side plant
        this.plantPart?.Destroy();
        // removePlant(player, this.seedPosition);
        this.grown = false;

        // Fire client-side visual event
        const harvestVisualEvent = ReplicatedStorage.WaitForChild("HarvestVisualEvent") as RemoteEvent;
        harvestVisualEvent.FireClient(player, this.plantData.plantId, plantPosition);
    }
    public discardPlant(player: Player) {
        this.plantPart?.Destroy();
        // removePlant(player, this.seedPosition);
        this.grown = false;
        this.plantPart = undefined;
    }

    // private handlePlayerData(player: Player, seedName: string) {
    //     print("Sending pickupItem event")
    //     pickupItem.FireServer(player, seedName, 5);
    //     return;
    // }

    private computeGrowthStage(): number {
        const now = os.time();
        const elapsed = now - this.plantData.plantedAt;
        if (elapsed >= this.totalGrowthTime) return this.plantPREFABS.size() - 1;
        return math.floor(elapsed / this.stageGrowthTime);
    }


    private evolveGrowth() {

        if (this.plantPart) {
            this.growthStage++;
            //const newPlantPart = this.seed.PREFABS[this.growthStage].Clone();
            const newPlantPart = this.plantPREFABS.find((part) => part.Name === `Stage${this.growthStage}`)?.Clone();
            if (!newPlantPart) {
                return;
            }
            newPlantPart.Parent = Workspace;
            moveInstance(newPlantPart, this.seedPosition, this.seedOrientation);
            this.plantInfoGui.Parent = newPlantPart;
            this.plantPart.Destroy();
            this.plantPart = newPlantPart;
        }
    }

    private trackGrowth(onFullyGrown?: () => void): void {
        print("TrackingGrowth: ", this.seedProgress.GetDescendants())
        const progressBar = this.seedProgress.GetDescendants().find(
            (d) => d.Name === "MoveProgress" && d.IsA("Frame")
        ) as Frame;

        do {
            if (this.cancelGrowth) {
                print("Growth tracking cancelled.");
                return;
            }

            const deltaTime = os.time() - this.plantData.plantedAt;
            const progress = new UDim2(math.clamp(deltaTime / this.totalGrowthTime, 0, 1), 0, 0, 0);
            progressBar.Position = new UDim2(progress.X.Scale, 0, 0, 0);

            if (os.time() - this.currentStageTime >= this.stageGrowthTime) {
                this.currentStageTime = os.time();
                const trackGrowthCoro = coroutine.create(() => this.evolveGrowth());
                coroutine.resume(trackGrowthCoro);
            }

            wait();
        } while (
            !this.cancelGrowth &&
            os.time() - this.plantData.plantedAt <= this.totalGrowthTime
        );

        if (this.cancelGrowth) {
            print("Growth tracking cancelled after loop.");
            return;
        }

        const trackGrowthCoro = coroutine.create(() => this.evolveGrowth());
        coroutine.resume(trackGrowthCoro);

        this.grown = true;

        if (onFullyGrown) {
            onFullyGrown();
        }
    }



    private setStageProgressBars() {
        const stagesFolder = this.seedProgress.GetDescendants().find(d => d.Name === "Stages" && d.IsA("Folder")) as Folder;
        const numOfStages: number = this.plantPREFABS.size() - 1;
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
}
