import { Players } from "@rbxts/services";
import { PlayerData } from "shared/types/PlayerData";
import { loadPlayerData, savePlayerData } from "shared/DataStoreWrapper";

const playerCache = new Map<number, PlayerData>();

Players.PlayerAdded.Connect(async (player) => {
    const data = await loadPlayerData(player.UserId);
    playerCache.set(player.UserId, data);
});

Players.PlayerRemoving.Connect(async (player) => {
    const data = playerCache.get(player.UserId);
    if (data) await savePlayerData(player.UserId, data);
    playerCache.delete(player.UserId);
});

task.spawn(() => {
    while (true) {
        task.wait(60);
        playerCache.forEach((data, userId) => {
            savePlayerData(userId, data)
        });
    }
});

export function getData(player: Player): PlayerData | undefined {
    return playerCache.get(player.UserId);
}

export function updateData<T extends keyof PlayerData>(
    player: Player,
    key: T,
    value: PlayerData[T],
) {
    const data = playerCache.get(player.UserId);
    if (data) data[key] = value;
}