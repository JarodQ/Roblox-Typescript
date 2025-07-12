import { Workspace, TweenService } from "@rbxts/services";

/**
 * Plays a laser beam effect from origin in the given direction.
 * The beam fades out and self-destructs after a short duration.
 */
export function playLaserBeamEffect(origin: Vector3, direction: Vector3) {
    const beamLength = direction.Magnitude;
    const midpoint = origin.add(direction.mul(0.5));

    // Create the beam part
    const beam = new Instance("Part");
    beam.Size = new Vector3(0.1, 0.1, beamLength);
    beam.CFrame = CFrame.lookAt(origin, origin.add(direction)).mul(
        new CFrame(0, 0, -beamLength / 2),
    );
    beam.Anchored = true;
    beam.CanCollide = false;
    beam.Material = Enum.Material.Neon;
    beam.Color = Color3.fromRGB(255, 0, 0); // Customize per weapon
    beam.Transparency = 0;
    beam.Parent = Workspace;

    // Tween the transparency to fade out
    const tween = TweenService.Create(beam, new TweenInfo(0.2), {
        Transparency: 1,
    });
    tween.Play();

    // Clean up after fade
    tween.Completed.Connect(() => beam.Destroy());
}