import { ReplicatedStorage, Workspace } from "@rbxts/services";

const objectsFolder = ReplicatedStorage.WaitForChild("Blaster").WaitForChild("Objects") as Folder;
const environmentImpactTemplate = objectsFolder.WaitForChild("EnvironmentImpact") as BasePart;
const characterImpactTemplate = objectsFolder.WaitForChild("CharacterImpact") as BasePart;

/**
 * Spawns an impact effect at the given position and normal.
 * Uses different templates for characters vs. environment.
 *
 * @param position - The world position of the impact
 * @param normal - The surface normal at the impact point
 * @param isCharacter - Whether the impact was on a character
 */
export function playImpactEffect(position: Vector3, normal: Vector3, isCharacter: boolean): void {
    const template = isCharacter ? characterImpactTemplate : environmentImpactTemplate;
    const impact = template.Clone();
    impact.CFrame = CFrame.lookAlong(position, normal);
    impact.Parent = Workspace;

    const spark = impact.FindFirstChild("SparkEmitter") as ParticleEmitter | undefined;
    const circle = impact.FindFirstChild("CircleEmitter") as ParticleEmitter | undefined;

    spark?.Emit(10);
    circle?.Emit(2);

    task.delay(0.5, () => {
        impact.Destroy();
    });
}