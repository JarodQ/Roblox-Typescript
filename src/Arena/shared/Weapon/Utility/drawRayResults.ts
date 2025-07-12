import { playLaserBeamEffect } from "Arena/shared/Weapon/Effects/LaserBeamEffect";
import { playImpactEffect } from "Arena/shared/Weapon/Effects/ImpactEffect";
import { RayResult } from "./castRays";

/**
 * Draws visual effects for each ray result:
 * - A laser beam from the origin to the hit point
 * - An impact effect at the hit location
 */
export function drawRayResults(origin: Vector3, rayResults: RayResult[]): void {
    for (const rayResult of rayResults) {
        playLaserBeamEffect(origin, rayResult.position.sub(origin));

        if (rayResult.instance) {
            const isCharacterHit = rayResult.taggedHumanoid !== undefined;
            playImpactEffect(rayResult.position, rayResult.normal, isCharacterHit);
        }
    }
}