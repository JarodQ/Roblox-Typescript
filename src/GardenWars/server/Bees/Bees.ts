import { Workspace, Players } from "@rbxts/services";
import { getPREFAB } from "GardenWars/shared/PREFABS";

const beehiveFolder = Workspace.WaitForChild("Beehives") as Folder;

export enum BeeType {
    WorkerBee = "WorkerBee",
    DroneBee = "DroneBee",
    KingBee = "KingBee",
    QueenBee = "QueenBee",
}

export enum BeeActionState {
    Resting = "resting",
    Roaming = "roaming",
    Attacking = "attacking",
    Returning = "returning",
}

export class Bee {
    private model: Model;
    private beehiveModel: Model;
    private state: BeeActionState = BeeActionState.Resting;

    private maxHealth = 100;
    private health = 100;
    private lastStingTime = 0;
    private readonly stingCooldown = 5; // seconds

    private roamPoint: Vector3;
    private readonly roamRadius = 50;
    private readonly aggroRadius = 25;
    private readonly defenseRadius = 50;
    private targetPlayer?: Player;

    constructor(beeType: BeeType) {
        // 🐝 Get prefab and clone
        const prefab = getPREFAB("Bees", beeType) as Model;
        this.model = prefab.Clone();
        this.model.Parent = Workspace;
        this.monitorHealth();
        // 🏠 Assign random beehive
        const beehives = beehiveFolder.GetChildren().filter((child) => child.IsA("Model"));
        this.beehiveModel = beehives[math.random(0, beehives.size() - 1)] as Model;

        // 📍 Position above hive
        const offset = new Vector3(0, 5, 0);
        const targetCFrame = this.beehiveModel.PrimaryPart!.CFrame.add(offset);
        this.model.PivotTo(targetCFrame);

        this.roamPoint = this.model.PrimaryPart?.Position ?? new Vector3(0, 0, 0);

        // 🐾 Start behavior
        this.roam();
        this.startAggroLoop();
    }

    public setState(newState: BeeActionState) {
        this.state = newState;
    }

    public getState(): BeeActionState {
        return this.state;
    }

    private monitorHealth() {
        const humanoid = this.model.FindFirstChildOfClass("Humanoid");
        if (!humanoid) return;

        const healthGui = this.model.FindFirstChild("HealthGui") as BillboardGui;
        const background = healthGui?.FindFirstChild("Background") as Frame;
        const healthBar = background?.FindFirstChild("Health") as Frame;

        const hitMarker = this.model.FindFirstChild("HitMarker") as Highlight;
        const TweenService = game.GetService("TweenService");

        humanoid.HealthChanged.Connect((newHealth) => {
            const delta = newHealth - this.health;
            this.health = newHealth;

            // 🟩 Update health bar size
            if (healthBar) {
                const ratio = math.clamp(this.health / this.maxHealth, 0, 1);
                healthBar.Size = new UDim2(ratio, 0, 1, 0); // scales width
            }

            if (delta < 0) {
                print(`🐝 ${this.model.Name} took ${-delta} damage!`);
                if (this.health <= 0) this.die();

                // 🔥 Tween HitMarker visibility
                if (hitMarker) {
                    hitMarker.FillTransparency = 0.5;

                    const tween = TweenService.Create(hitMarker, new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
                        FillTransparency: 1,
                    });
                    tween.Play();
                }
            } else if (delta > 0) {
                print(`🐝 ${this.model.Name} healed ${delta} health.`);
            }
        });
    }



    public heal(amount: number) {
        this.health = math.min(this.maxHealth, this.health + amount);
    }

    private die() {
        this.model.Destroy();
    }

    public roam() {
        if (!this.beehiveModel || !this.beehiveModel.PrimaryPart) return;

        this.setState(BeeActionState.Roaming);

        const origin = this.beehiveModel.PrimaryPart.Position;
        const angle = math.random() * 2 * math.pi;
        const distance = math.random() * this.roamRadius;

        const offset = new Vector3(math.cos(angle) * distance, 0, math.sin(angle) * distance);
        const targetPosition = origin.add(offset);

        const humanoid = this.model.FindFirstChildOfClass("Humanoid");
        if (humanoid) {
            humanoid.MoveTo(targetPosition);
            humanoid.MoveToFinished.Once((reached) => {
                if (!reached) return;
                const lingerTime = math.random(1, 5);
                task.delay(lingerTime, () => {
                    if (this.state === BeeActionState.Roaming) {
                        this.roam();
                    }
                });
            });
        }
    }

    public attack(player: Player) {
        const now = tick();
        if (now - this.lastStingTime < this.stingCooldown) {
            this.roam(); // cooldown active — skip sting, resume roaming
            return;
        }

        const root = player.Character?.FindFirstChild("HumanoidRootPart") as BasePart;
        const humanoid = this.model.FindFirstChildOfClass("Humanoid") as Humanoid;
        if (!root || !humanoid) return;

        this.targetPlayer = player;
        this.setState(BeeActionState.Attacking);

        humanoid.WalkToPart = root;
        humanoid.WalkToPoint = new Vector3(0, 0, 0);

        humanoid.MoveToFinished.Once((reached) => {
            if (reached && this.state === BeeActionState.Attacking) {
                this.stingTarget(); // sting + roam
            }
        });
    }


    public rest() {
        this.setState(BeeActionState.Resting);
    }

    public checkAggro(player: Player, isStealing: boolean) {
        const root = player.Character?.FindFirstChild("HumanoidRootPart") as BasePart;
        const beeRoot = this.model.PrimaryPart;
        if (!root || !beeRoot) return;

        const distance = beeRoot.Position.sub(root.Position).Magnitude;

        if (isStealing && distance <= this.defenseRadius) {
            this.attack(player);
        } else if (distance <= this.aggroRadius) {
            this.attack(player);
        }
    }

    private stingTarget() {
        if (!this.targetPlayer) return;

        this.lastStingTime = tick();

        const character = this.targetPlayer.Character;
        if (!character) return;

        const head = character.FindFirstChild("Head") as Part;
        if (!head) return;

        const humanoid = character.FindFirstChildOfClass("Humanoid");
        if (!humanoid) return;

        const TweenService = game.GetService("TweenService");

        // 🎭 Get original face and head color from account
        const description = humanoid.GetAppliedDescription();
        const originalSize = new Vector3(1.198, 1.202, 1.198)
        print("Face:", description.Face)
        const originalHeadColor = description.HeadColor;



        // 📏 Modify head for sting effect
        head.Size = originalSize.mul(2);
        head.Color = new Color3(255 / 255, 71 / 255, 74 / 255);

        // 🎯 Fling in arc toward hive
        const flingPart = Workspace.FindFirstChild("FlingPlayerToPart") as BasePart;
        this.flingPlayer(this.targetPlayer, flingPart);

        // 🎬 Tween head back after delay
        task.delay(1.2, () => {
            const sizeTween = TweenService.Create(head, new TweenInfo(3), {
                Size: originalSize,
            });
            const colorTween = TweenService.Create(head, new TweenInfo(3), {
                Color: originalHeadColor,
            });
            sizeTween.Play();
            colorTween.Play();


        });

        print(`${this.model.Name} stung ${this.targetPlayer.Name} and flung them in an arc!`);
        this.roam();
    }




    private flingPlayer(player: Player, targetPart: BasePart) {
        const character = player.Character;
        if (!character) return;

        const humanoidRoot = character.FindFirstChild("HumanoidRootPart") as BasePart;
        const humanoid = character.FindFirstChildOfClass("Humanoid");
        if (!humanoid || !humanoidRoot) return;


        // 🚀 Arc velocity calculation
        const origin = humanoidRoot.Position;
        const target = targetPart.Position;
        const displacement = target.sub(origin);
        const horizontal = new Vector3(displacement.X, 0, displacement.Z);
        const distance = horizontal.Magnitude;

        const timeToTarget = 1;
        const gravity = Workspace.Gravity;

        const velocityY = gravity * timeToTarget * 0.5;
        const velocityXZ = horizontal.div(2);
        const launchVelocity = new Vector3(velocityXZ.X, velocityY, velocityXZ.Z);

        // 💨 Apply launch force
        const bodyVelocity = new Instance("BodyVelocity");
        bodyVelocity.Velocity = launchVelocity;
        bodyVelocity.MaxForce = new Vector3(1e5, 1e5, 1e5);
        bodyVelocity.P = 1250;
        bodyVelocity.Parent = humanoidRoot;
        // 🧹 Cleanup after flight
        task.delay(timeToTarget, () => {
            bodyVelocity.Destroy();

        });
    }

    private startAggroLoop() {
        task.spawn(() => {
            while (this.model.Parent) {
                const players = Players.GetPlayers();
                for (const player of players) {
                    this.checkAggro(player, false);
                    task.wait(0.05);
                }
                task.wait(1);
            }
        });
    }
}

