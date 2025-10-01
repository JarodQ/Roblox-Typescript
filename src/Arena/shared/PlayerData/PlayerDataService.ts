import { Players } from "@rbxts/services";
import { PlayerData, PlayerFlags } from "./PlayerData";
import { loadPlayerData, savePlayerData, getPlayerKey } from "./DataStoreWrapper";
import { DataStoreService } from "@rbxts/services";

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

// export function updateData<T extends keyof PlayerData>(
//     player: Player,
//     key: T,
//     value: PlayerData[T],
// ) {
//     const data = playerCache.get(player.UserId);
//     const current = data?.[key];

//     if (typeIs(current, 'number') && typeIs(value, 'number')) {
//         data![key] = current + value as PlayerData[T];
//         print(`Changed: ${value} amount to ${tostring(key)} to Player: ${player}`);
//     }
//     if (typeIs(current, 'boolean') && typeIs(value, 'boolean')) {
//         if (value === true) return;
//         data![key] = !current as PlayerData[T];
//         print(`Changed: ${value} boolean to ${tostring(key)} for Player: ${player}`);
//     }

// }

export function updateFlag<
    G extends keyof PlayerData,
    K extends keyof PlayerData[G]
>(
    player: Player,
    group: G,
    key: K,
    value: PlayerData[G][K],
) {
    const data = playerCache.get(player.UserId);
    if (!data) return;

    const current = data[group][key];
    if (typeIs(current, typeOf(value))) {
        data[group][key] = value;
        print(`Updated ${group}.${tostring(key)} to ${value} for Player: ${player}`);
    }
}


game.BindToClose(() => {
    for (const [userId, data] of playerCache) {
        savePlayerData(userId, data);
        lockStore.UpdateAsync(`${getPlayerKey(userId)}:lock`, () => $tuple(undefined));
    }
})