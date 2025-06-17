import { ReplicatedStorage } from "@rbxts/services";

export const PREFABFolder: Folder = ReplicatedStorage.WaitForChild("PREFABS") as Folder;
export const SeedPREFABS: Folder = PREFABFolder.WaitForChild("Seeds") as Folder;

export function getPREFAB(folder: string, name: string): Part | undefined {
    let PREFAB: Part | undefined;
    if (folder === "seeds") PREFAB = seeds?.get(name);
    if (PREFAB) return PREFAB;
    return;
}

export const seeds: Map<string, Part> = new Map();
for (let seed of SeedPREFABS.GetChildren()) {
    seeds.set(seed.Name, seed as Part);
}

