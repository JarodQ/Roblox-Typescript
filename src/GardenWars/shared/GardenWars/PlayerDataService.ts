import { Players } from "@rbxts/services";
import { PlayerData } from "GardenWars/shared/GardenWars/types/PlayerData";
import { loadPlayerData, savePlayerData } from "GardenWars/shared/GardenWars/DataStoreWrapper";
import { DataStoreService } from "@rbxts/services";
import { getPlayerKey } from "GardenWars/shared/GardenWars/DataStoreWrapper";

const playerCache = new Map<number, PlayerData>();
const lockStore = DataStoreService.GetDataStore("PlayerData_Lock");

Players.PlayerAdded.Connect(async (player) => {
    const data = await loadPlayerData(player.UserId);
    playerCache.set(player.UserId, data);
});

Players.PlayerRemoving.Connect(async (player) => {
    const data = playerCache.get(player.UserId);
    if (data) {
        await savePlayerData(player.UserId, data);

        lockStore.UpdateAsync(getPlayerKey(player.UserId) + ":lock", () => $tuple(undefined));
    }
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

export function lowercaseFirst(str: string): string {
    if (str.size() === 0) return str;

    const first = str.sub(1, 1).lower();

    const rest = str.sub(2);
    print(first, rest);
    return first + rest;
}

export function updateData<T extends keyof PlayerData>(
    player: Player,
    key: T,
    value: PlayerData[T],
) {
    const data = playerCache.get(player.UserId);
    if (data) data[key] += value;
    print(`Added: ${value} ${key} to Player: ${player}`);
}

game.BindToClose(() => {
    for (const [userId, data] of playerCache) {
        savePlayerData(userId, data);
        lockStore.UpdateAsync(`${getPlayerKey(userId)}:lock`, () => $tuple(undefined));
    }
})