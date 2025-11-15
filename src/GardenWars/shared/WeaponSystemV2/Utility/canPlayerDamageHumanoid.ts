import { Players } from "@rbxts/services";

export function canPlayerDamageHumanoid(player: Player, taggedHumanoid: Humanoid): boolean {
    // If the humanoid is already dead, no need to apply more damage
    // print("Checking if player can damage humanoid")
    if (taggedHumanoid.Health <= 0) {
        // print("Tagged humanoid has no health")
        return false;
    }

    const taggedCharacter = taggedHumanoid.Parent;
    const taggedPlayer = Players.GetPlayerFromCharacter(taggedCharacter);
    // print("taggedPlayer")
    // If the player tagged a non-player humanoid then allow damage
    if (!taggedPlayer) {
        return true;
    }

    // If either player is neutral (i.e. not on a team) then allow damage
    if (player.Neutral || taggedPlayer.Neutral) {
        return true;
    }

    // Only allow damage if the players are not on the same team
    return player.Team !== taggedPlayer.Team;
}
