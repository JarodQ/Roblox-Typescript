import { getPREFAB } from "GardenWars/shared/PREFABS";
import { moveInstance } from "GardenWars/shared/Gardens/VisualUtils";
import { PlantData, PlantId } from "Common/server/Data/Template";
import { Workspace } from "@rbxts/services";
import { PlantInfoDictionary } from "../GardensV2/PlantInfo";
import { PlantRarity } from "Common/server/Data/Template";
import { HarvestEvent, StingEvent } from "../Bees/BeeEvents";

export class FieldPlant {
    private readonly fieldRegion?: Region3; // 👈 make optional
    private readonly plantId: PlantId;
    private readonly rarity: PlantRarity;
    private readonly level: number;
    private readonly respawnDelay: number;
    private readonly onExpire: () => void;

    private plantPart?: Part | Model;
    private readonly plantPREFABS: Part[];
    private lifetime = 0;
    private timeLabel?: TextLabel;

    constructor(
        fieldRegion: Region3 | undefined, // 👈 allow undefined
        plantId: PlantId,
        rarity: PlantRarity,
        level: number,
        respawnDelay = 15,
        onExpire: () => void,
        position?: Vector3 // 👈 optional position override
    ) {
        this.fieldRegion = position ? undefined : fieldRegion; // 👈 bypass region if position provided
        this.plantId = plantId;
        this.rarity = rarity;
        this.level = level;
        this.respawnDelay = respawnDelay;
        this.onExpire = onExpire;

        this.plantPREFABS = getPREFAB("seeds", plantId) as Part[];
        this.spawnFullyGrownPlant(position);
    }

    private getRandomPosition(): Vector3 {
        if (!this.fieldRegion) {
            warn("⚠️ No fieldRegion provided and no position override — defaulting to origin");
            return new Vector3(0, 0.5, 0); // 👈 force Y = 0.5
        }

        const min = this.fieldRegion.CFrame.Position.sub(this.fieldRegion.Size.div(2));
        const max = this.fieldRegion.CFrame.Position.add(this.fieldRegion.Size.div(2));

        const x = math.random(min.X, max.X);
        const z = math.random(min.Z, max.Z);

        return new Vector3(x, 0.5, z); // 👈 force Y = 0.5
    }


    private spawnFullyGrownPlant(positionOverride?: Vector3) {
        const finalStageIndex = this.plantPREFABS.size() - 1;
        const finalStage = this.plantPREFABS.find((part) => part.Name === `Stage${finalStageIndex}`)?.Clone();
        if (!finalStage) return;

        this.plantPart = finalStage;
        this.plantPart.Name = "FieldPlant";
        this.plantPart.Parent = Workspace;

        // 👇 Use override if provided, else region
        const rawPosition = positionOverride ?? this.getRandomPosition();

        // 👇 Clamp Y to 0.5 regardless
        const position = new Vector3(rawPosition.X, 0.5, rawPosition.Z);

        moveInstance(this.plantPart, position, new Vector3(0, math.random(0, 360), 0));

        this.attachBillboardGui();
        this.attachProximityPrompt();
        this.startLifetimeTimer();
    }



    private attachBillboardGui() {
        if (!this.plantPart) return;

        const root = this.plantPart.IsA("Model")
            ? this.plantPart.FindFirstChild("Root") as BasePart
            : this.plantPart;

        if (!root || !root.IsA("BasePart")) return;

        const guis = getPREFAB("UI", "FieldPlantInfo") as BillboardGui[];
        const gui = guis[0].Clone();
        gui.Adornee = root;
        gui.Parent = this.plantPart;

        const frame = gui.FindFirstChild("Frame") as Frame;
        if (!frame) return;
        const nameLabel = frame.FindFirstChild("Name") as TextLabel;
        const perSecondLabel = frame.FindFirstChild("PerSecond") as TextLabel;
        const rarityLabel = frame.FindFirstChild("Rarity") as TextLabel;
        this.timeLabel = frame.FindFirstChild("Time") as TextLabel;

        if (!nameLabel || !perSecondLabel || !rarityLabel || !this.timeLabel) return;

        nameLabel.Text = this.plantId;
        nameLabel.TextColor3 = PlantInfoDictionary.RarityColors[this.rarity];
        rarityLabel.Text = this.rarity;
        rarityLabel.TextColor3 = PlantInfoDictionary.RarityColors[this.rarity];
        perSecondLabel.Text = `$${PlantInfoDictionary.getIncomeRate(this.plantId, this.rarity, 1)}/s`;
    }

    // 👇 Add ProximityPrompt
    private attachProximityPrompt() {
        if (!this.plantPart) return;

        const root = this.plantPart.IsA("Model")
            ? this.plantPart.FindFirstChild("Root") as BasePart
            : this.plantPart;

        if (!root || !root.IsA("BasePart")) return;

        const prompt = new Instance("ProximityPrompt");
        prompt.ActionText = "Harvest Plant";
        prompt.ObjectText = this.plantId;
        prompt.HoldDuration = 1;
        prompt.MaxActivationDistance = 12;
        prompt.RequiresLineOfSight = false;
        prompt.Parent = root;

        prompt.Triggered.Connect((player) => {
            const char = player.Character;
            if (!char) return;

            const torso = this.getTorso(char);
            if (!torso) return;

            // 👇 Check if player already has a harvested plant
            const carried = char.FindFirstChild("HarvestedPlant") as Model;
            if (carried) {
                const carriedId = carried.GetAttribute("PlantId") as PlantId;
                const carriedRarity = carried.GetAttribute("PlantRarity") as PlantRarity; // 👈 read rarity

                const oldRoot = this.plantPart?.IsA("Model")
                    ? (this.plantPart.FindFirstChild("Root") as BasePart)
                    : (this.plantPart as BasePart);

                const oldPos = oldRoot?.Position;

                carried.Destroy();

                // 👇 Use carriedRarity instead of this.rarity
                new FieldPlant(
                    this.fieldRegion,
                    carriedId,
                    carriedRarity,
                    this.level,
                    this.respawnDelay,
                    this.onExpire,
                    oldPos
                );
            }



            // 👇 Attach the newly harvested plant to player
            const prefabModel = getPREFAB("PottedPlants", this.plantId) as Model;
            const clone = prefabModel.Clone();
            clone.Name = "HarvestedPlant";
            clone.SetAttribute("PlantId", this.plantId);
            clone.SetAttribute("PlantRarity", this.rarity); // 👈 store rarity too
            clone.Parent = char;

            const modelRoot = clone.FindFirstChild("Root") as BasePart;
            if (!modelRoot) return;

            modelRoot.CFrame = torso.CFrame.mul(new CFrame(0, 0, 1));

            const weld = new Instance("WeldConstraint");
            weld.Part0 = modelRoot;
            weld.Part1 = torso;
            weld.Parent = modelRoot;

            this.givePlayerPottedPlantInfo(player, this.plantId, this.rarity, clone);
            HarvestEvent.Fire(player);
            // Destroy the field plant
            if (this.plantPart) {
                this.plantPart.Destroy();
            }

            task.delay(this.respawnDelay, () => this.onExpire());
        });

    }

    private getTorso(character: Model): BasePart | undefined {
        const upperTorso = character.FindFirstChild("UpperTorso");
        if (upperTorso && upperTorso.IsA("BasePart")) return upperTorso;

        const torso = character.FindFirstChild("Torso");
        if (torso && torso.IsA("BasePart")) return torso;

        return character.FindFirstChild("HumanoidRootPart") as BasePart; // fallback
    }

    private givePlayerPottedPlantInfo(player: Player, plantId: PlantId, rarity: PlantRarity, carriedModel: Model) {
        // Clone the UI prefab
        const prefab = getPREFAB("UI", "PottedPlantInfo") as BillboardGui[];
        const gui = prefab[0].Clone();
        gui.Name = "PottedPlantInfo";

        // Find the Root part of the carried model
        const root = carriedModel.FindFirstChild("Root") as BasePart;
        if (!root) return;

        gui.Adornee = root;
        gui.Parent = carriedModel; // 👈 attach to the model on the player's back

        // Find the Frame and its labels
        const frame = gui.FindFirstChild("Frame") as Frame;
        if (!frame) return;

        const nameLabel = frame.FindFirstChild("Name") as TextLabel;
        const perSecondLabel = frame.FindFirstChild("PerSecond") as TextLabel;
        const rarityLabel = frame.FindFirstChild("Rarity") as TextLabel;

        if (!nameLabel || !perSecondLabel || !rarityLabel) return;

        // Populate from PlantInfoDictionary
        nameLabel.Text = plantId;
        nameLabel.TextColor3 = PlantInfoDictionary.RarityColors[rarity];

        rarityLabel.Text = rarity;
        rarityLabel.TextColor3 = PlantInfoDictionary.RarityColors[rarity];

        perSecondLabel.Text = `$${PlantInfoDictionary.getIncomeRate(plantId, rarity, 1)}/s`;
    }



    // ⏱️ Lifetime timer
    private startLifetimeTimer() {
        this.lifetime = math.random(60, 120); // 1–2 minutes

        task.spawn(() => {
            while (this.lifetime > 0 && this.plantPart) {
                if (this.timeLabel) {
                    this.timeLabel.Text = "⏰" + this.lifetime + "s";
                }
                task.wait(1);
                this.lifetime--;
            }

            if (this.plantPart) {
                this.plantPart.Destroy();
            }

            task.delay(this.respawnDelay, () => this.onExpire());
        });
    }
}

StingEvent.Event.Connect((player: Player, position: Vector3) => {
    const char = player.Character;
    if (!char) return;

    const carried = char.FindFirstChild("HarvestedPlant") as Model;
    if (!carried) return;

    const carriedId = carried.GetAttribute("PlantId") as PlantId;
    const carriedRarity = carried.GetAttribute("PlantRarity") as PlantRarity;

    carried.Destroy();

    // 👇 Replant at sting location
    new FieldPlant(
        undefined, // you’ll need to know which field region to use
        carriedId,
        carriedRarity,
        1,
        0,
        () => { },
        position
    );
});

