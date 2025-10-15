import { WEAPON_SLOT_RULES, WeaponSlot } from "Arena/shared/Gui/LoadoutGui/loadoutRules";

export interface WeaponFlags {
    carrotShooter: boolean;
    blueberryBlaster: boolean;
    maizeMauler: boolean;
    heliosLaser: boolean;
}

export interface AmmunitionFlags {
    carrots: number;
    blueberries: number;
    corn: number;
    sunflowers: number;
}

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

export interface PlayerFlags {
    weapons: WeaponFlags,
    ammunition: AmmunitionFlags,
    achievements: AchievementFlags,
    settings: SettingsFlags,
}

export interface Currency {
    credits: number;
    valor: number;
}

export interface PlayerData {
    // flags: PlayerFlags
    currency: Currency,
    weapons: WeaponFlags,
    ammunition: AmmunitionFlags,
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
    ammunition: {
        carrots: 0,
        blueberries: 0,
        corn: 0,
        sunflowers: 0,
    },
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