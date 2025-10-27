import { ReplicatedStorage } from "@rbxts/services";
import { playerCache } from "Common/server/PlayerDataService";
import { shopInfo, shopList, itemInfo } from "./mainShopPrices";

const shopRemoteEvent = new Instance("RemoteEvent");
shopRemoteEvent.Name = "shopRemoteEvent";
shopRemoteEvent.Parent = ReplicatedStorage;

function findValueReference(obj: unknown, targetKey: string): [Record<string, unknown>, string] | undefined {
    if (typeIs(obj, "table")) {
        for (const [key, value] of pairs(obj)) {
            if (key === targetKey && (typeIs(value, "number") || typeIs(value, "boolean"))) {
                return [obj as Record<string, unknown>, key];
            }

            const nested = findValueReference(value, targetKey);
            if (nested !== undefined) {
                return nested;
            }
        }
    }
    return undefined;
}

shopRemoteEvent.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
    const [action, item, currencyType, amountRaw] = args as [string, keyof shopInfo, keyof itemInfo, number];

    if (typeOf(amountRaw) !== "number" || amountRaw <= 0) {
        print(`❌ Invalid amount: ${amountRaw}`);
        return;
    }

    const amount = amountRaw;

    const playerData = playerCache.get(player.UserId);
    if (!playerData) return;

    print("🧠 Getting player's data for transaction:", playerData);
    print("🔍 Requested:", action, item, currencyType, "Amount:", amount);

    // Resolve currency and item references
    const currencyRef = findValueReference(playerData, currencyType);
    const itemRef = findValueReference(playerData, item);

    if (!currencyRef || !itemRef) {
        print("❌ Missing currency or item reference");
        return;
    }

    const [currencyParent, currencyKey] = currencyRef;
    const [itemParent, itemKey] = itemRef;

    const itemData = shopList[item];
    if (!itemData) {
        print(`❌ Item ${item} not found in shopList`);
        return;
    }

    const priceData = itemData[currencyType];
    if (!priceData) {
        print(`❌ Currency ${currencyType} not found for item ${item}`);
        return;
    }

    const buyPrice = priceData.buyPrice;
    const sellPrice = priceData.sellPrice;
    const currentCurrency = currencyParent[currencyKey] as number;
    const currentItemValue = itemParent[itemKey];

    print(`🛒 ${player.Name} wants to ${action} ${amount}x ${item} using ${currencyType}`);
    print(`💰 Before: ${currencyType} = ${currentCurrency}, ${item} = ${currentItemValue}`);

    if (action === "Buy") {
        const totalCost = buyPrice * amount;
        if (currentCurrency >= totalCost) {
            if (typeIs(currentItemValue, "boolean")) {
                if (!currentItemValue) {
                    itemParent[itemKey] = true;
                    currencyParent[currencyKey] = currentCurrency - totalCost;
                    print(`✅ Unlocked ${item} for ${totalCost} ${currencyType}`);
                } else {
                    print(`⚠️ ${item} already unlocked`);
                }
            } else if (typeIs(currentItemValue, "number")) {
                itemParent[itemKey] = currentItemValue + amount;
                currencyParent[currencyKey] = currentCurrency - totalCost;
                print(`✅ Bought ${amount}x ${item} for ${totalCost} ${currencyType}`);
            }
        } else {
            print(`❌ Not enough ${currencyType} to buy ${amount}x ${item}`);
        }
    } else if (action === "Sell") {
        if (typeIs(currentItemValue, "number") && currentItemValue >= amount) {
            itemParent[itemKey] = currentItemValue - amount;
            currencyParent[currencyKey] = currentCurrency + sellPrice * amount;
            print(`✅ Sold ${amount}x ${item} for ${sellPrice * amount} ${currencyType}`);
        } else {
            print(`❌ Cannot sell ${amount}x ${item}: not enough quantity`);
        }
    } else {
        print(`❌ Invalid action: ${action}`);
    }

    const updatedCurrency = currencyParent[currencyKey];
    const updatedItemValue = itemParent[itemKey];

    print(`📊 After: ${currencyType} = ${updatedCurrency}, ${item} = ${updatedItemValue}`);
});