import { Players, ReplicatedStorage } from "@rbxts/services";
import { PlayerData, Plants } from "Common/shared/PlayerData/PlayerData";
import { loadPlayerData, savePlayerData, getPlayerKey } from "./DataStoreWrapper";
import { DataStoreService } from "@rbxts/services";
import { findItemById } from "Common/shared/ItemData";

const plantSeedEvent = new Instance("RemoteEvent");
plantSeedEvent.Name = "PlantSeed";
plantSeedEvent.Parent = ReplicatedStorage;

const requestPlayerData = new Instance("RemoteFunction");
requestPlayerData.Name = "RequestPlayerData";
requestPlayerData.Parent = ReplicatedStorage

const addPlantEvent = new Instance("RemoteEvent");
addPlantEvent.Name = "AddPlant";
addPlantEvent.Parent = ReplicatedStorage;

const removePlantEvent = new Instance("RemoteEvent");
removePlantEvent.Name = "RemovePlant";
removePlantEvent.Parent = ReplicatedStorage;

const updateFlagEvent = new Instance("RemoteEvent");
updateFlagEvent.Name = "UpdateFlagByPath";
updateFlagEvent.Parent = ReplicatedStorage;

const getPlayerData = new Instance("RemoteFunction");
getPlayerData.Name = "GetPlayerData";
getPlayerData.Parent = ReplicatedStorage;

const purchaseFunction = new Instance("RemoteFunction");
purchaseFunction.Name = "PurchaseItem";
purchaseFunction.Parent = ReplicatedStorage;

const pickupItem = new Instance("RemoteEvent");
pickupItem.Name = "PickupItem";
pickupItem.Parent = ReplicatedStorage;

const updateHotbarData = new Instance("RemoteEvent");
updateHotbarData.Name = "UpdateHotbarData";
updateHotbarData.Parent = ReplicatedStorage;

export const playerCache = new Map<number, PlayerData>();
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

requestPlayerData.OnServerInvoke = (player: Player) => {
    return playerCache.get(player.UserId);
};

task.spawn(() => {
    while (true) {
        task.wait(10);
        playerCache.forEach((data, userId) => {
            savePlayerData(userId, data)
        });
    }
});

getPlayerData.OnServerInvoke = (player: Player) => {
    return playerCache.get(player.UserId) as PlayerData;
};

export function findPlayerItemVariant(data: PlayerData, itemId: string) {
    // print(itemId)
    for (const [, entry] of pairs(data.items)) {
        for (const [, variant] of pairs(entry.variants)) {
            if (variant.id === itemId) {
                return variant;
            }
        }
    }
    return undefined;
}

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
        // print(`Updated ${tostring(group)}.${tostring(key)} to ${value} for Player: ${player}`);
    }
}

updateFlagEvent.OnServerEvent.Connect((player, ...args) => {
    const [path, value] = args as [string, unknown];
    const data = playerCache.get(player.UserId);
    if (!data) return;

    const keys = path.split(".");
    let target: unknown = data;

    for (let i = 0; i < keys.size() - 1; i++) {
        if (typeOf(target) !== "table") {
            warn(`Invalid path segment: ${keys[i]}`);
            return;
        }

        const segment = keys[i];
        const nextSeg = (target as Record<string, unknown>)[segment];

        if (nextSeg === undefined) {
            warn(`Missing path segment: ${segment}`);
            return;
        }

        target = nextSeg;
    }

    if (typeOf(target) !== "table") {
        warn(`Invalid final target at path: ${path}`);
        return;
    }

    const finalKey = keys[keys.size() - 1];
    const current = (target as Record<string, unknown>)[finalKey];

    const currentType = typeOf(current);
    const valueType = typeOf(value);

    if (currentType === "boolean") {
        (target as Record<string, unknown>)[finalKey] = true;
        // print(`Set ${path} to true for Player: ${player.Name}`);
    } else if (currentType === "number" && valueType === "number") {
        const newValue = (current as number) + (value as number);
        (target as Record<string, unknown>)[finalKey] = newValue;
        // print(`Added ${value} to ${path}, new value is ${newValue} for Player: ${player.Name}`);
    } else {
        warn(`Type mismatch at ${path}: expected ${currentType}, got ${valueType}`);
    }
});

export function handleUpdateFlagEvent(player: Player, ...args: unknown[]) {
    const [path, value] = args as [string, unknown];
    const data = playerCache.get(player.UserId);
    if (!data) return;

    const keys = path.split(".");
    let target: unknown = data;

    for (let i = 0; i < keys.size() - 1; i++) {
        if (typeOf(target) !== "table") {
            warn(`Invalid path segment: ${keys[i]}`);
            return;
        }

        const segment = keys[i];
        const nextSeg = (target as Record<string, unknown>)[segment];

        if (nextSeg === undefined) {
            warn(`Missing path segment: ${segment}`);
            return;
        }

        target = nextSeg;
    }

    if (typeOf(target) !== "table") {
        warn(`Invalid final target at path: ${path}`);
        return;
    }

    const finalKey = keys[keys.size() - 1];
    const current = (target as Record<string, unknown>)[finalKey];

    const currentType = typeOf(current);
    const valueType = typeOf(value);

    if (currentType === "boolean") {
        (target as Record<string, unknown>)[finalKey] = true;
        // print(`Set ${path} to true for Player: ${player.Name}`);
    } else if (currentType === "number" && valueType === "number") {
        const newValue = (current as number) + (value as number);
        (target as Record<string, unknown>)[finalKey] = newValue;
        // print(`Added ${value} to ${path}, new value is ${newValue} for Player: ${player.Name}`);
    } else {
        warn(`Type mismatch at ${path}: expected ${currentType}, got ${valueType}`);
    }
}

pickupItem.OnServerEvent.Connect((player, ...args) => {
    const [seedName] = args as [string];
    const amount = 5;
    if (amount <= 0) return;

    const data = playerCache.get(player.UserId);
    if (!data) return;
    // print("Seed Name: ", seedName)
    const variant = findPlayerItemVariant(data, seedName);
    // print("Variant: ", variant)
    if (!variant) {
        warn(`Player ${player.Name} does not own variant ${seedName}`);
        return;
    }

    variant.ownedQuantity += amount;
    // print(`Gave ${amount}x ${seedName} to ${player.Name}. New total: ${variant.ownedQuantity}`);

    //savePlayerData(player.UserId, data);
});

export function helper(player: Player, seedName: string, amount: number) {

}

updateHotbarData.OnServerEvent.Connect((player, ...args) => {
    const [hotbarData] = args as [Record<number, string>]
    const playerData = playerCache.get(player.UserId);
    if (playerData && playerData.hotbarItems) {
        playerData.hotbarItems = hotbarData;
    }
});

purchaseFunction.OnServerInvoke = (player, ...args) => {
    const [itemId, quantity, currency, mode] = args as [string, number, "credits" | "valor", "buy" | "sell"];
    if (quantity <= 0) return;

    const data = playerCache.get(player.UserId);
    if (!data) return;

    const item = findItemById(itemId);
    if (!item) return;

    const pricePerUnit = item.prices[mode][currency];
    if (pricePerUnit === undefined) return;

    const total = pricePerUnit * quantity;
    const playerCurrency = data.currency[currency];

    if (mode === "buy") {
        if (playerCurrency < total) {
            warn(`Player ${player.Name} can't afford ${itemId}`);
            return;
        }
        data.currency[currency] -= total;

        for (const [_, entry] of pairs(data.items)) {
            for (const [_, variant] of pairs(entry.variants)) {
                if (variant.id === itemId) {
                    variant.ownedQuantity += quantity;
                    break;
                }
            }
        }
    } else if (mode === "sell") {
        for (const [_, entry] of pairs(data.items)) {
            for (const [_, variant] of pairs(entry.variants)) {
                if (variant.id === itemId) {
                    if (variant.ownedQuantity < quantity) {
                        warn(`Player ${player.Name} tried to sell too many ${itemId}`);
                        return;
                    }
                    variant.ownedQuantity -= quantity;
                    data.currency[currency] += total;
                    break;
                }
            }
        }
    }

    savePlayerData(player.UserId, data);
    return data; // ✅ Return updated PlayerData
};

game.BindToClose(() => {
    for (const [userId, data] of playerCache) {
        savePlayerData(userId, data);
        lockStore.UpdateAsync(`${getPlayerKey(userId)}:lock`, () => $tuple(undefined));
    }
})