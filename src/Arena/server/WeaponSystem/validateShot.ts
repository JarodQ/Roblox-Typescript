import { ReplicatedStorage, Workspace } from "@rbxts/services";

import Constants from "Arena/shared/WeaponSystemV2/Weapon/Constants";

const TIMESTAMP_BUFFER_CONSTANT = 1;
const POSITION_BUFFER_CONSTANT = 5;
const POSITION_BUFFER_FACTOR = 0.4;

export default function validateShot(
    player: Player,
    timestamp: number,
    blaster: Tool,
    origin: CFrame,
): boolean {
    // Validate timestamp
    const now = Workspace.GetServerTimeNow();
    if (timestamp > now || timestamp < now - TIMESTAMP_BUFFER_CONSTANT) {
        return false;
    }

    // Validate character and humanoid
    const character = player.Character;
    if (!character) return false;

    const humanoid = character.FindFirstChildOfClass("Humanoid");
    if (!humanoid || humanoid.Health <= 0) return false;

    const primaryPart = character.PrimaryPart;
    if (!primaryPart) return false;

    // Validate blaster state
    if (blaster.Parent !== character) return false;

    const isReloading = blaster.GetAttribute(Constants.RELOADING_ATTRIBUTE);
    if (isReloading) return false;

    const ammo = blaster.GetAttribute(Constants.AMMO_ATTRIBUTE) as number;
    if (ammo <= 0) return false;

    // Validate origin position
    const distance = primaryPart.Position.sub(origin.Position).Magnitude;
    const maxDistance = POSITION_BUFFER_CONSTANT + primaryPart.AssemblyLinearVelocity.Magnitude * POSITION_BUFFER_FACTOR;
    if (distance > maxDistance) return false;

    return true;
}
