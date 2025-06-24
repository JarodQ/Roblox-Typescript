import { Players, Workspace, ReplicatedStorage, RunService } from "@rbxts/services";
import { TweenService } from "@rbxts/services";
const interactEvent = ReplicatedStorage.WaitForChild("InteractEvent") as RemoteEvent;

const interactionMap = new Map<Instance, Interactable>();

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
        const vertical = new Vector3(0, math.sin(t * math.pi) * arcHeight, 0);
        root.CFrame = new CFrame(startPosition.add(horizontal).add(vertical));
    });

    tween.Play();

    tween.Completed.Connect(() => {
        connection.Disconnect();
        driver.Destroy();
        task.delay(1, () => popClone.Destroy());
    });
}

export function playPopEffect(position: Vector3, popPrefab: Instance) {
    const popClone = popPrefab.Clone();
    popClone.Parent = Workspace;

    let root: BasePart | undefined;

    if (popClone.IsA("Model")) {
        root = popClone.PrimaryPart ?? popClone.FindFirstChildWhichIsA("BasePart");
        if (!root) {
            warn("No BasePart found in model Prefab");
            popClone.Destroy();
            return;
        }
        popClone.PivotTo(new CFrame(position.sub(new Vector3(0, 0, 0))));
    } else if (popClone.IsA("BasePart")) {
        root = popClone;
        root.Position = position.sub(new Vector3(0, -2, 0));
    } else {
        warn("Unsupported instance type for pop effect");
        popClone.Destroy();
        return;
    }
    root.Anchored = false;

    root.AssemblyAngularVelocity = new Vector3(
        math.random() * 10,
        math.random() * 10,
        math.random() * 10
    );

    const direction = new Vector3(0, 1, 0).Unit;
    const strength = 50;
    root.AssemblyLinearVelocity = direction.mul(50); // Immediate motion
    root.ApplyImpulse(direction.mul(strength * root.AssemblyMass));

    //task.delay(2, () => {
    //    popClone.Destroy();
    //})
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
        return InteractionRegistry.get(target);
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