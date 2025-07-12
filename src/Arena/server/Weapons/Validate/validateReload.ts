import { Constants } from "Arena/shared/Weapon/Constants";

/**
 * Validates whether the player is allowed to reload the given blaster.
 *
 * @param player - The player attempting to reload
 * @param blaster - The tool representing the blaster
 * @returns Whether the reload is valid
 */
export function validateReload(player: Player, blaster: Tool): boolean {
    const character = player.Character;
    if (!character) return false;

    if (blaster.Parent !== character) return false;

    const isReloading = blaster.GetAttribute(Constants.RELOADING_ATTRIBUTE);
    if (isReloading === true) return false;

    return true;
}