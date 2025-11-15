import { ReplicatedStorage, Workspace } from "@rbxts/services";

import Constants from "GardenWars/shared/WeaponSystemV2/Weapon/Constants";

const TIMESTAMP_BUFFER_CONSTANT = 1;
const POSITION_BUFFER_CONSTANT = 10;
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
    print("Character found")
    const humanoid = character.FindFirstChildOfClass("Humanoid");
    if (!humanoid || humanoid.Health <= 0) return false;
    print("humanoid found")
    const primaryPart = character.PrimaryPart;
    if (!primaryPart) return false;
    print("Primary part found")
    // Validate blaster state
    if (blaster.Parent !== character) return false;
    print("blaster parented to character")
    const isReloading = blaster.GetAttribute(Constants.RELOADING_ATTRIBUTE);
    if (isReloading) return false;
    print("notreloading")
    const ammo = blaster.GetAttribute(Constants.AMMO_ATTRIBUTE) as number;
    if (ammo <= 0) return false;
    print("ammo in weapon")
    // Validate origin position
    // const distance = primaryPart.Position.sub(origin.Position).Magnitude;
    // const maxDistance = POSITION_BUFFER_CONSTANT + primaryPart.AssemblyLinearVelocity.Magnitude * POSITION_BUFFER_FACTOR;
    // if (distance > maxDistance) return false;
    // print("Distance: ", distance, " is not greater than max distance: ", maxDistance)
    return true;
}
