import { ReplicatedStorage, Workspace } from "@rbxts/services";

const blasterFolder = ReplicatedStorage.WaitForChild("Blaster") as Folder;
const objectsFolder = blasterFolder.WaitForChild("Objects") as Folder;

const environmentImpactTemplate = objectsFolder.WaitForChild("EnvironmentImpact") as Part;
const characterImpactTemplate = objectsFolder.WaitForChild("CharacterImpact") as Part;

export default function impactEffect(position: Vector3, normal: Vector3, isCharacter: boolean): void {
    const template = isCharacter ? characterImpactTemplate : environmentImpactTemplate;
    const impact = template.Clone();

    impact.CFrame = CFrame.lookAlong(position, normal);
    impact.Parent = Workspace;

    const sparkEmitter = impact.FindFirstChild("SparkEmitter") as ParticleEmitter | undefined;
    const circleEmitter = impact.FindFirstChild("CircleEmitter") as ParticleEmitter | undefined;

    sparkEmitter?.Emit(10);
    circleEmitter?.Emit(2);

    task.delay(0.5, () => {
        impact.Destroy();
    });
}
