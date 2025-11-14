import { getPREFAB } from "GardenWars/shared/PREFABS";
import { moveInstance } from "GardenWars/shared/Gardens/VisualUtils";
import { PlantData } from "Common/server/Data/Template";
import { Workspace } from "@rbxts/services";
import { PlantInfoDictionary } from "../GardensV2/PlantInfo";
import { PlantRarity } from "Common/server/Data/Template";

export class FieldPlant {
    private readonly fieldRegion: Region3;
    private readonly plantId: string;
    private readonly rarity: string;
    private readonly level: number;
    private readonly respawnDelay: number;

    private plantPart?: Part | Model;
    private readonly plantPREFABS: Part[];

    constructor(fieldRegion: Region3, plantId: string, rarity: string, level: number, respawnDelay = 15) {
        this.fieldRegion = fieldRegion;
        this.plantId = plantId;
        this.rarity = rarity;
        this.level = level;
        this.respawnDelay = respawnDelay;

        this.plantPREFABS = getPREFAB("seeds", plantId) as Part[];
        this.spawnFullyGrownPlant();
    }

    private getRandomPosition(): Vector3 {
        const min = this.fieldRegion.CFrame.Position.sub(this.fieldRegion.Size.div(2));
        const max = this.fieldRegion.CFrame.Position.add(this.fieldRegion.Size.div(2));

        const x = math.random(min.X, max.X);
        const y = math.random(min.Y, max.Y);
        const z = math.random(min.Z, max.Z);

        return new Vector3(x, y, z);
    }

    private spawnFullyGrownPlant() {
        const finalStageIndex = this.plantPREFABS.size() - 1;
        const finalStage = this.plantPREFABS.find((part) => part.Name === `Stage${finalStageIndex}`)?.Clone();
        if (!finalStage) return;

        this.plantPart = finalStage;
        this.plantPart.Name = "FieldPlant";
        this.plantPart.Parent = Workspace;

        const position = this.getRandomPosition();
        moveInstance(this.plantPart, position, new Vector3(0, math.random(0, 360), 0));

        this.attachBillboardGui();

        this.trackRespawn();
    }


    private trackRespawn() {
        if (!this.plantPart) return;

        this.plantPart.Destroying.Connect(() => {
            this.plantPart = undefined;
            task.delay(this.respawnDelay, () => {
                this.spawnFullyGrownPlant();
            });
        });
    }

    private attachBillboardGui() {
        if (!this.plantPart) return;

        const root = this.plantPart.IsA("Model")
            ? this.plantPart.FindFirstChild("Root") as BasePart
            : this.plantPart;

        if (!root || !root.IsA("BasePart")) return;

        const gui = new Instance("BillboardGui");
        gui.Name = "PlantLabel";
        gui.Size = new UDim2(0, 100, 0, 40);
        gui.StudsOffset = new Vector3(0, 3, 0);
        gui.AlwaysOnTop = true;
        gui.Adornee = root;
        gui.Parent = this.plantPart;

        const label = new Instance("TextLabel");
        label.Size = new UDim2(1, 0, 1, 0);
        label.BackgroundTransparency = 1;
        label.Text = this.plantId;
        label.TextColor3 = PlantInfoDictionary.RarityColors[this.rarity as PlantRarity];
        label.TextScaled = true;
        label.Font = Enum.Font.GothamBold;
        label.Parent = gui;
    }

}
