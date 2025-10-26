import { WEAPON_SLOT_RULES, WeaponSlot } from "Arena/shared/Gui/LoadoutGui/loadoutRules";

export interface WeaponFlags {
    carrotShooter: boolean;
    blueberryBlaster: boolean;
    maizeMauler: boolean;
    heliosLaser: boolean;
}

interface ItemEntry {
    name: string;
    description: string;
    variants: {
        seed?: PlayerItemData;
        weaponSeed?: PlayerItemData;
        crop?: PlayerItemData;
    };
}

export interface PlayerItemData {
    id: string; // Unique identifier (e.g. "carrot_seed")
    name: string; // Display name (e.g. "Carrot Seed")
    description: string;
    image: string; // Image asset ID or path
    category: "seeds" | "crops";
    ownedQuantity: number;
    stackable: boolean;
    maxStackSize?: number;
}

// export interface CropsFlags {
//     carrots: number;
//     blueberries: number;
//     corn: number;
//     sunflowers: number;
// }

export interface Statistics {
    experience: number,
    level: number,
    kills: number,
    deaths: number,
}
export interface AchievementFlags {
}

export interface SettingsFlags {
}


export interface Currency {
    credits: number;
    valor: number;
}

export interface PlayerData {
    currency: Currency,
    weapons: WeaponFlags,
    items: Record<string, ItemEntry>,
    loadouts: Loadouts,
    plants: Plants[],
    achievements: AchievementFlags,
    settings: SettingsFlags,
}

export type WeaponAssignments = Partial<Record<WeaponSlot, string | null>>;

export interface Loadout {
    name: string;
    weapons: WeaponAssignments;
}

export interface Loadouts {
    [key: string]: Loadout;
}

export interface Plants {
    plantId: string;
    position: { x: number; y: number; z: number };
    rotation: number[];
    plantedAt: number;
}

const DEFAULT_ITEM_LIST: Record<string, ItemEntry> = {
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
                ownedQuantity: 0,
                stackable: true,
            },
            weaponSeed: {
                id: "carrot_weapon_seed",
                name: "Carrot Shooter Seed",
                description: "Plant to grow weaponized carrots.",
                image: "rbxassetid://108601628629100",
                category: "seeds",
                ownedQuantity: 0,
                stackable: true,
            },
            crop: {
                id: "carrot_crop",
                name: "Carrots",
                description: "Harvested carrots used for ammo or trade.",
                image: "rbxassetid://108601628629100",
                category: "crops",
                ownedQuantity: 0,
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
                image: "rbxassetid://108601628629101",
                category: "seeds",
                ownedQuantity: 0,
                stackable: true,
            },
            weaponSeed: {
                id: "blueberryBlaster_seed",
                name: "Blueberry Blaster Seed",
                description: "Plant to grow weaponized blueberries.",
                image: "rbxassetid://108601628629100",
                category: "seeds",
                ownedQuantity: 0,
                stackable: true,
            },
            crop: {
                id: "blueberry_crop",
                name: "Blueberries",
                description: "Freshly harvested blueberries, great for selling or crafting potions.",
                image: "rbxassetid://108601628629102",
                category: "crops",
                ownedQuantity: 0,
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
                image: "rbxassetid://108601628629103",
                category: "seeds",
                ownedQuantity: 0,
                stackable: true,
                maxStackSize: 99,
            },
            weaponSeed: {
                id: "maizeMauler_seed",
                name: "Maize Mauler Seed",
                description: "Plant to grow weaponized corn.",
                image: "rbxassetid://108601628629100",
                category: "seeds",
                ownedQuantity: 0,
                stackable: true,
            },
            crop: {
                id: "corn_crop",
                name: "Corn",
                description: "Harvested corn, great for selling or crafting food items.",
                image: "rbxassetid://108601628629104",
                category: "crops",
                ownedQuantity: 0,
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
                image: "rbxassetid://108601628629105",
                category: "seeds",
                ownedQuantity: 0,
                stackable: true,
                maxStackSize: 99,
            },
            weaponSeed: {
                id: "heliosLaser_seed",
                name: "Helios Laser Seed",
                description: "Plant to grow weaponized sunflower.",
                image: "rbxassetid://108601628629100",
                category: "seeds",
                ownedQuantity: 0,
                stackable: true,
            },
            crop: {
                id: "sunflower_crop",
                name: "Sunflower",
                description: "Harvested sunflower, prized for its vibrant petals and trade value.",
                image: "rbxassetid://108601628629106",
                category: "crops",
                ownedQuantity: 0,
                stackable: true,
                maxStackSize: 99,
            },
        },
    },
}

export const DEFAULT_PLAYER_DATA: PlayerData = {
    currency: {
        credits: 100000,
        valor: 0,
    },
    weapons: {
        carrotShooter: true,
        blueberryBlaster: true,
        maizeMauler: true,
        heliosLaser: false,
    },
    items: DEFAULT_ITEM_LIST,
    loadouts: {
        loadout1: {
            name: "My First Loadout",
            weapons: {
                primary: "",
                secondary: "",
                utility: "",
            }
        },
        loadout2: {
            name: "Loadout 2",
            weapons: {
                primary: "",
                secondary: "",
                utility: "",
            }
        },
        loadout3: {
            name: "Loadout 3",
            weapons: {
                primary: "",
                secondary: "",
                utility: "",
            }
        },
        loadout4: {
            name: "Loadout 4",
            weapons: {
                primary: "",
                secondary: "",
                utility: "",
            }
        },
    } as Loadouts,
    plants: [],
    achievements: {

    },
    settings: {

    },
}