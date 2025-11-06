import { RayResult } from "./castRays";
import laserBeamEffect from "../Effects/laserBeamEffects";
import impactEffect from "../Effects/impactEffects";

export function drawRayResults(position: Vector3, rayResults: RayResult[]): void {
    for (const rayResult of rayResults) {
        laserBeamEffect(position, rayResult.position);

        if (rayResult.instance) {
            const isHumanoid = rayResult.taggedHumanoid !== undefined;
            impactEffect(rayResult.position, rayResult.normal, isHumanoid);
        }
    }
}
