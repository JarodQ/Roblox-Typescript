export function getRayDirections(
    origin: CFrame,
    numberOfRays: number,
    spreadAngle: number,
    seed: number,
): Vector3[] {
    // Multiply seed to avoid repetition across whole seconds
    const random = new Random(seed * 100_000);
    const rays: Vector3[] = [];

    for (let i = 0; i < numberOfRays; i++) {
        const roll = random.NextNumber() * math.pi * 2;
        const pitch = random.NextNumber() * spreadAngle;

        const rayCFrame = origin.mul(CFrame.Angles(0, 0, roll)).mul(CFrame.Angles(pitch, 0, 0));
        rays.push(rayCFrame.LookVector);
    }

    return rays;
}