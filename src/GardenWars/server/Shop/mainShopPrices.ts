import { ReplicatedStorage } from "@rbxts/services";

const requestShopPrice = new Instance("RemoteFunction");
requestShopPrice.Name = "RequestShopPrice";
requestShopPrice.Parent = ReplicatedStorage

const requestShopList = new Instance("RemoteFunction");
requestShopList.Name = "RequestShopList";
requestShopList.Parent = ReplicatedStorage

requestShopPrice.OnServerInvoke = (player: Player, ...args: unknown[]): number => {
    const [currentItem, transactionType, currencyType] = args as [keyof shopInfo, "Buy" | "Sell", keyof itemInfo];

    // print("Receiving shop info for:", currentItem, "Transaction:", transactionType, "Currency:", currencyType);

    const item = shopList[currentItem];
    if (!item) return 0;

    const currencyData = item[currencyType];
    if (!currencyData) return 0;

    return transactionType === "Buy" ? currencyData.buyPrice : currencyData.sellPrice;
};

requestShopList.OnServerInvoke = (): shopInfo => {
    return shopList;
};

export interface Credits {
    buyPrice: number;
    sellPrice: number;
}

export interface Valor {
    buyPrice: number;
    sellPrice: number;
}

export interface itemInfo {
    credits: Credits;
    valor: Valor;
}

export interface shopInfo {
    carrots: itemInfo,
    blueberries: itemInfo,
    corn: itemInfo,
    sunflowers: itemInfo,
}

export const shopList: shopInfo = {
    carrots: {
        credits: {
            buyPrice: 10,
            sellPrice: 5,
        },
        valor: {
            buyPrice: 10,
            sellPrice: 5,
        }
    },
    blueberries: {
        credits: {
            buyPrice: 20,
            sellPrice: 10,
        },
        valor: {
            buyPrice: 20,
            sellPrice: 10,
        }
    },
    corn: {
        credits: {
            buyPrice: 40,
            sellPrice: 20,
        },
        valor: {
            buyPrice: 40,
            sellPrice: 20,
        }
    },
    sunflowers: {
        credits: {
            buyPrice: 60,
            sellPrice: 30,
        },
        valor: {
            buyPrice: 60,
            sellPrice: 30,
        }
    },

}