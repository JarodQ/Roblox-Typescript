import { Players, Workspace, ReplicatedStorage, RunService } from "@rbxts/services";
import { TweenService } from "@rbxts/services";
const interactEvent = ReplicatedStorage.WaitForChild("InteractEvent") as RemoteEvent;

export const interactionMap = new Map<Instance, Interactable>();

function rotateIndefinitely(instance: BasePart | Model, duration = 5): void {
    if (instance.IsA("BasePart")) {
        // Tween rotation for BasePart
        const tweenInfo = new TweenInfo(
            duration,
            Enum.EasingStyle.Linear,
            Enum.EasingDirection.In,
            -1, // infinite loop
            false,
            0
        );

        const goal = {
            Orientation: instance.Orientation.add(new Vector3(0, 360, 0)),
        };

        const tween = TweenService.Create(instance, tweenInfo, goal);
        tween.Play();

    } else if (instance.IsA("Model")) {
        // Rotate using Heartbeat for Model
        let angle = 0;
        const speedRadPerSec = math.rad(360 / duration);

        RunService.Heartbeat.Connect((dt) => {
            const deltaAngle = speedRadPerSec * dt;
            angle += deltaAngle;

            const pivot = instance.GetPivot();
            const rotation = CFrame.Angles(0, deltaAngle, 0);
            instance.PivotTo(pivot.mul(rotation));
        });
    }
}

export function tweenArcPop(position: Vector3, popPrefab: Instance) {
    const popClone = popPrefab.Clone();
    popClone.Parent = Workspace;

    let root: BasePart | undefined;

    if (popClone.IsA("Model")) {
        root = popClone.PrimaryPart ?? popClone.FindFirstChildWhichIsA("BasePart");
        popClone.PivotTo(new CFrame(position));
    } else if (popClone.IsA("BasePart")) {
        root = popClone;
        root.Position = position;
    } else {
        popClone.Destroy();
        return;
    }

    if (!root) {
        popClone.Destroy();
        return;
    }

    root.Anchored = true;

    // Create driver for tween progression
    const driver = new Instance("NumberValue");
    driver.Value = 0;
    driver.Parent = root;

    const duration = 0.5;
    const arcHeight = 5;

    // Generate a random 2D horizontal direction
    const theta = math.random() * 2 * math.pi;
    const direction = new Vector3(math.cos(theta), 0, math.sin(theta)).Unit;
    const arcDistance = direction.mul(6); // Total horizontal distance

    const tween = TweenService.Create(
        driver,
        new TweenInfo(duration, Enum.EasingStyle.Linear),
        { Value: 1 },
    );

    const startPosition = position;

    const connection = driver.GetPropertyChangedSignal("Value").Connect(() => {
        const t = driver.Value;
        const horizontal = arcDistance.mul(0.5 * (1 - math.cos(t * math.pi)));
        const vertical = new Vector3(0, math.sin(t * math.pi) * arcHeight + 1, 0);
        root.CFrame = new CFrame(startPosition.add(horizontal).add(vertical));
    });

    tween.Play();

    tween.Completed.Connect(() => {
        connection.Disconnect();
        driver.Destroy();
        rotateIndefinitely(root);
        //task.delay(1, () => popClone.Destroy());
    });
}

export function moveInstance(instance: Instance, position: Vector3) {
    let root: BasePart | undefined;
    if (instance.IsA("Model")) {
        root = instance.PrimaryPart ?? instance.FindFirstChildWhichIsA("BasePart");
        print(instance.PrimaryPart);
        if (root?.Anchored === true) root.Anchored = false;
        root?.PivotTo(new CFrame(position))
        if (root) root.Anchored = true;
    } else if (instance.IsA("BasePart")) {
        root = instance;
        root.Position = position;
    }
}

export const InteractionRegistry = {
    register(instance: Instance, interactable: Interactable) {
        interactionMap.set(instance, interactable);
    },
    unregister(instance: Instance) {
        interactionMap.delete(instance);
    },
    get(instance: Instance): Interactable | undefined {
        return interactionMap.get(instance);
    },
    getAll(): Map<Instance, Interactable> {
        return interactionMap;
    }
}

export interface Interactable {
    onInteract(player: Player, ...args: unknown[]): void;
}

export interface Harvestable extends Interactable {
    isReadyToHarvest(): boolean;
    harvest(player: Player): void;
}

function isBasePart(value: unknown): value is BasePart {
    return typeIs(value, "Instance") && value.IsA("BasePart");
}

function resolveInteractableFromPart(target: unknown): Interactable | undefined {
    if (isBasePart(target)) {
        const root = target.FindFirstAncestorOfClass("Model") ?? target;
        return InteractionRegistry.get(root);
    }
    return;
}

interactEvent.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
    const [target, clickPosition, interactee] = args;
    if (target) {
        const interactable = resolveInteractableFromPart(target);
        interactable?.onInteract(player, clickPosition, interactee);
    }

})