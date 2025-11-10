import { Workspace, TweenService, RunService, ReplicatedStorage } from "@rbxts/services";

// const pickupItem = ReplicatedStorage.WaitForChild("PickupItem") as RemoteEvent;


export function tweenArcPop(player: Player, dataName: string, position: Vector3, popPrefab: Instance, range?: number) {
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
    pickup(player, dataName, root, range);

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
        const cancelSpin = rotateIndefinitely(root);
        pickup(player, dataName, root, range, cancelSpin);
        //task.delay(1, () => popClone.Destroy());
    });
}

function rotateIndefinitely(instance: BasePart | Model, duration = 5): () => void {
    let cleanup: () => void = () => { };

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

        cleanup = () => tween.Cancel();
    } else if (instance.IsA("Model")) {
        let active = true;
        const connection = RunService.Heartbeat.Connect((dt) => {
            if (!active) return;

            const delta = CFrame.Angles(0, math.rad(360 * dt / duration), 0);
            instance.PivotTo(instance.GetPivot().mul(delta));
        });

        cleanup = () => {
            active = false;
            connection.Disconnect();
        };
    }
    return cleanup;
}

export async function pickup(player: Player, dataName: string, pickupModel: BasePart, range?: number, onPickupReached?: () => void) {
    if (!range) range = 10;
    const speed = 1;

    while (true) {
        const character = player.Character;
        if (character) {
            const humanoidRoot = character.FindFirstChild("HumanoidRootPart") as BasePart;
            if (humanoidRoot) {
                const distance = humanoidRoot.Position.sub(pickupModel.Position).Magnitude;
                if (distance <= range) {
                    if (onPickupReached) {
                        onPickupReached();
                        return;
                    }

                    while (pickupModel.Position.sub(humanoidRoot.Position).Magnitude > 3) {
                        const target = new CFrame(pickupModel.Position, humanoidRoot.Position)
                            .add((humanoidRoot.Position.sub(pickupModel.Position)).Unit.mul(0.5));
                        pickupModel.CFrame = pickupModel.CFrame.Lerp(target, speed);
                        await Promise.delay(0.01);
                    }

                    pickupModel.Destroy();
                    // pickupItem.FireServer(dataName);
                    break;

                    //Fire Server to change player Data HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!

                    // dataName = lowercaseFirst(dataName);
                    // const keyInfo = findPlayerDataKeyPath(dataName);
                    // if (keyInfo.exists) {
                    //     // updateFlagByPathEvent.FireServer(keyInfo.path, 5);
                    //     handleUpdateFlagEvent(keyInfo.path, 5)
                    // } else {
                    //     warn(`🚫 Invalid key: ${dataName}`);
                    // }
                    // return;
                }
            }
        }
        await Promise.delay(0.1);
    }

}

export function moveInstance(instance: Instance, position: Vector3, orientation: Vector3) {
    let root: BasePart | undefined;
    if (instance.IsA("Model")) {
        root = instance.PrimaryPart ?? instance.FindFirstChildWhichIsA("BasePart");
        if (root?.Anchored === true) root.Anchored = false;
        const rotation = CFrame.Angles(
            math.rad(orientation.X),
            math.rad(orientation.Y),
            math.rad(orientation.Z),
        );
        const targetCFrame = new CFrame(position).mul(rotation);
        root?.PivotTo(targetCFrame);
        if (root) root.Anchored = true;
    } else if (instance.IsA("BasePart")) {
        root = instance;
        root.Position = position;
        root.Orientation = orientation;
    }
}