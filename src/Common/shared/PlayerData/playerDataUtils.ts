import { PlayerData, Loadouts, Loadout } from "./PlayerData";
import { DEFAULT_PLAYER_DATA } from "./PlayerData";

export interface KeyPathResult {
    exists: boolean;
    path?: string;
    value?: unknown;
}

export function mergeDefaults<T>(target: T, defaults: T): T {
    for (const [key, value] of pairs(defaults as Record<string, unknown>)) {
        const current = (target as Record<string, unknown>)[key];

        if (current === undefined) {
            (target as Record<string, unknown>)[key] = value;
        } else if (typeOf(current) === "table" && typeOf(value) === "table") {
            mergeDefaults(current, value);
        }
    }

    return target;
}

export function lowercaseFirst(str: string): string {
    if (str.size() === 0) return str;

    const first = str.sub(1, 1).lower();

    const rest = str.sub(2);
    print(first, rest);
    return first + rest;
}

export function getTrueFlags<T extends object>(flags: T): (keyof T)[] {
    const result: (keyof T)[] = [];

    for (const [key, value] of pairs(flags)) {
        if (typeIs(value, "boolean") && value === true) {
            result.push(key as keyof T);
        }
    }

    return result;
}

export function findPlayerDataKeyPath(key: string, playerData?: PlayerData): KeyPathResult {
    function search(obj: unknown, currentPath: string[] = []): KeyPathResult {
        if (typeOf(obj) !== "table") return { exists: false };

        for (const [k, value] of pairs(obj as Record<string, unknown>)) {
            const newPath = [...currentPath, k];

            if (k === key) {
                return {
                    exists: true,
                    path: newPath.join("."),
                    value,
                };
            }

            const result = search(value, newPath);
            if (result.exists) return result;
        }

        return { exists: false };
    }

    return search(playerData ?? DEFAULT_PLAYER_DATA);
}

//Loadout Functions
export function getLoadouts<T extends object>(loadouts: T): [keyof T, T[keyof T]][] {
    const result: [keyof T, T[keyof T]][] = [];

    for (const [key] of pairs(loadouts)) {
        const value = loadouts[key as keyof T];
        result.push([key as keyof T, value]);
    }

    return result;
}

export function getSortedLoadouts(loadouts: Loadouts): [keyof Loadouts, Loadout][] {
    const keys: (keyof Loadouts)[] = [];

    for (const [key] of pairs(loadouts)) {
        keys.push(key as keyof Loadouts);
    }
    keys.sort(); // sorts alphabetically: "loadout1", "loadout2", ...
    return keys.map((key) => [key, loadouts[key]]);
}

export function resolvePlayerData(playerData: PlayerData, key: string,): KeyPathResult {
    function search(obj: unknown, currentPath: string[] = []): KeyPathResult {
        if (typeOf(obj) !== "table") return { exists: false };

        for (const [k, value] of pairs(obj as Record<string, unknown>)) {
            const newPath = [...currentPath, k];

            if (k === key) {
                return {
                    exists: true,
                    path: newPath.join("."),
                    value,
                };
            }

            const result = search(value, newPath);
            if (result.exists) return result;
        }

        return { exists: false };
    }

    return search(playerData);
}
