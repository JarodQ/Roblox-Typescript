import { ReplicatedStorage } from "@rbxts/services";
// import { getData } from "./PlayerData/PlayerDataService";
// import { savePlayerData } from "./PlayerData/DataStoreWrapper";


export interface ItemData {
    id: string; // Unique identifier (e.g. "carrot_seed")
    name: string; // Display name (e.g. "Carrot Seed")
    description: string;
    image: string; // Image asset ID or path
    category: "seeds" | "crops";

    prices: {
        buy: {
            credits: number;
            valor?: number;
        };
        sell: {
            credits: number;
            valor?: number;
        };
    };

    stackable: boolean;
    maxStackSize?: number;

    // Optional runtime fields
    ownedQuantity?: number;
}

interface ItemEntry {
    name: string;
    description: string;
    variants: {
        seed?: ItemData;
        weaponSeed?: ItemData;
        crop?: ItemData;
    };
}

export interface shopInfo {
    carrots: ItemEntry,

}


export function getShopItemsForCategory(category: "seeds" | "crops"): ItemData[] {
    const items: ItemData[] = [];

    function collect(obj: unknown) {
        if (typeIs(obj, "table")) {
            // Check if this is an ItemData-like object
            const maybeItem = obj as Partial<ItemData>;
            if (typeOf(maybeItem.id) === "string" && maybeItem.category === category) {
                items.push(maybeItem as ItemData);
                return;
            }

            // Recurse into nested objects
            for (const [_, value] of pairs(obj as Record<string, unknown>)) {
                collect(value);
            }
        }
    }

    for (const [_, entry] of pairs(shopList)) {
        collect(entry.variants);
    }

    return items;
}

export function findItemById(itemId: string): ItemData | undefined {
    for (const [_, entry] of pairs(shopList)) {
        for (const [_, variant] of pairs(entry.variants)) {
            if (variant.id === itemId) {
                return variant;
            }
        }
    }
    return undefined;
}



export const shopList: Record<string, ItemEntry> = {
    carrots: {
        name: "Carrots",
        description: "Entry for all Carrot Items",
        variants: {
            seed: {
                id: "carrot_seed",
                name: "Carrot Seed",
                description: "Plant to grow carrots.",
                image: "rbxassetid://108601628629100",
                category: "seeds",
                prices: {
                    buy: { credits: 10, valor: 1 },
                    sell: { credits: 5 },
                },
                stackable: true,
            },
            weaponSeed: {
                id: "carrotShooter_seed",
                name: "Carrot Shooter Seed",
                description: "Plant to grow weaponized carrots.",
                image: "rbxassetid://111369018411705",
                category: "seeds",
                prices: {
                    buy: { credits: 15, valor: 2 },
                    sell: { credits: 7 },
                },
                stackable: true,
            },
            crop: {
                id: "carrot_crop",
                name: "Carrots",
                description: "Harvested carrots used for ammo or trade.",
                image: "rbxassetid://108601628629100",
                category: "crops",
                prices: {
                    buy: { credits: 20 },
                    sell: { credits: 12 },
                },
                stackable: true,
            },
        },

    },
    blueberries: {
        name: "Blueberries",
        description: "Sweet and juicy berries, perfect for trade or crafting.",
        variants: {
            seed: {
                id: "blueberry_seed",
                name: "Blueberry Seed",
                description: "Plant to grow blueberry bushes.",
                image: "rbxassetid://139245603700947",
                category: "seeds",
                prices: {
                    buy: { credits: 12, valor: 2 },
                    sell: { credits: 6 },
                },
                stackable: true,
            },
            weaponSeed: {
                id: "blueberryBlaster_seed",
                name: "Blueberry Blaster Seed",
                description: "Plant to grow weaponized blueberries.",
                image: "rbxassetid://129472140650048",
                category: "seeds",
                prices: {
                    buy: { credits: 15, valor: 2 },
                    sell: { credits: 7 },
                },
                stackable: true,
            },
            crop: {
                id: "blueberry_crop",
                name: "Blueberries",
                description: "Freshly harvested blueberries, great for selling or crafting potions.",
                image: "rbxassetid://139245603700947",
                category: "crops",
                prices: {
                    buy: { credits: 24 },
                    sell: { credits: 14, valor: 3 },
                },
                stackable: true,
            },
        },
    },
    corn: {
        name: "Corn",
        description: "A tall, versatile plant used for food, trade, and crafting.",
        variants: {
            seed: {
                id: "corn_seed",
                name: "Corn Seed",
                description: "Plant to grow tall corn stalks.",
                image: "rbxassetid://76605413606941",
                category: "seeds",
                prices: {
                    buy: { credits: 14, valor: 1 },
                    sell: { credits: 6 },
                },
                stackable: true,
                maxStackSize: 99,
            },
            weaponSeed: {
                id: "maizeMauler_seed",
                name: "Maize Mauler Seed",
                description: "Plant to grow weaponized corn.",
                image: "rbxassetid://140686676686152",
                category: "seeds",
                prices: {
                    buy: { credits: 15, valor: 2 },
                    sell: { credits: 7 },
                },
                stackable: true,
            },
            crop: {
                id: "corn_crop",
                name: "Corn",
                description: "Harvested corn, great for selling or crafting food items.",
                image: "rbxassetid://76605413606941",
                category: "crops",
                prices: {
                    buy: { credits: 28 },
                    sell: { credits: 16, valor: 2 },
                },
                stackable: true,
                maxStackSize: 99,
            },
        },
    },
    sunflowers: {
        name: "Sunflowers",
        description: "Bright, radiant plants known for their beauty and high trade value.",
        variants: {
            seed: {
                id: "sunflower_seed",
                name: "Sunflower Seed",
                description: "Plant to grow tall, radiant sunflowers.",
                image: "rbxassetid://105812995170847",
                category: "seeds",
                prices: {
                    buy: { credits: 18, valor: 2 },
                    sell: { credits: 9 },
                },
                stackable: true,
                maxStackSize: 99,
            },
            weaponSeed: {
                id: "heliosLaser_seed",
                name: "Helios Laser Seed",
                description: "Plant to grow weaponized sunflower.",
                image: "rbxassetid://109999962651743",
                category: "seeds",
                prices: {
                    buy: { credits: 15, valor: 2 },
                    sell: { credits: 7 },
                },
                stackable: true,
            },
            crop: {
                id: "sunflower_crop",
                name: "Sunflower",
                description: "Harvested sunflower, prized for its vibrant petals and trade value.",
                image: "rbxassetid://105812995170847",
                category: "crops",
                prices: {
                    buy: { credits: 36 },
                    sell: { credits: 20, valor: 3 },
                },
                stackable: true,
                maxStackSize: 99,
            },
        },
    },
}