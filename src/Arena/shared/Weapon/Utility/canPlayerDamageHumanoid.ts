import { Players } from "@rbxts/services";

/**
 * Determines whether the given player can damage the specified humanoid.
 * Considers team alignment, neutrality, and whether the target is a player.
 */
export function canPlayerDamageHumanoid(player: Player, taggedHumanoid: Humanoid): boolean {
    // Don't damage dead humanoids
    if (taggedHumanoid.Health <= 0) {
        return false;
    }

    const taggedCharacter = taggedHumanoid.Parent;
    const taggedPlayer = Players.GetPlayerFromCharacter(taggedCharacter);

    // Allow damage to NPCs or non-player humanoids
    if (!taggedPlayer) {
        return true;
    }

    // Allow damage if either player is neutral
    if (player.Neutral || taggedPlayer.Neutral) {
        return true;
    }

    // Otherwise, only allow damage if they're on different teams
    return player.Team !== taggedPlayer.Team;
}