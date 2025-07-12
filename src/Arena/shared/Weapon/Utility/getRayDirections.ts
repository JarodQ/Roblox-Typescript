/**
 * Generates a list of direction vectors from a given origin CFrame,
 * applying randomized spread using a seeded RNG.
 *
 * @param origin - The CFrame from which rays originate
 * @param numberOfRays - How many rays to generate
 * @param spreadAngle - Maximum pitch angle in radians
 * @param seed - A numeric seed (e.g. timestamp) for deterministic randomness
 * @returns An array of direction vectors
 */
export function getRayDirections(
    origin: CFrame,
    numberOfRays: number,
    spreadAngle: number,
    seed: number,
): Vector3[] {
    const rng = new Random(seed * 100_000);
    const rays: Vector3[] = [];

    for (let i = 0; i < numberOfRays; i++) {
        const roll = rng.NextNumber() * math.pi * 2;
        const pitch = rng.NextNumber() * spreadAngle;

        const rayCFrame = origin.mul(CFrame.Angles(0, 0, roll)).mul(CFrame.Angles(pitch, 0, 0));
        rays.push(rayCFrame.LookVector);
    }

    return rays;
}