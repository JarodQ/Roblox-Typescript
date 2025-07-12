import { Players } from "@rbxts/services";

/**
 * Immediately invokes the callback for all current players,
 * and connects it to future PlayerAdded events.
 *
 * @param callback - A function to run for each player
 * @returns The RBXScriptConnection to PlayerAdded
 */
export function safePlayerAdded(callback: (player: Player) => void): RBXScriptConnection {
    for (const player of Players.GetPlayers()) {
        task.spawn(callback, player);
    }

    return Players.PlayerAdded.Connect(callback);
}