import { WEAPON_SLOT_RULES, WeaponSlot } from "../Gui/LoadoutGui/loadoutRules";

export interface WeaponFlags {
    carrotShooter: boolean;
    blueberryBlaster: boolean;
    maizeMauler: boolean;
}

export interface AmmunitionFlags {
    carrots: number;
    blueberries: number;
    corn: number;
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

export interface PlayerData {
    // flags: PlayerFlags
    weapons: WeaponFlags,
    ammunition: AmmunitionFlags,
    loadouts: Loadouts,
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

export const DEFAULT_PLAYER_DATA: PlayerData = {
    weapons: {
        carrotShooter: true,
        blueberryBlaster: true,
        maizeMauler: true,
    },
    ammunition: {
        carrots: 0,
        blueberries: 0,
        corn: 0,
    },
    loadouts: {
        loadout1: {
            name: "My First Loadout",
            weapons: {
                primary: "maizeMauler",
                secondary: "carrotShooter",
                utility: "blueberryBlaster",
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
    },
    achievements: {

    },
    settings: {

    },
}