import { ReplicatedStorage } from "@rbxts/services";

export const PREFABFolder: Folder = ReplicatedStorage.WaitForChild("PREFABS") as Folder;
export const SeedPREFABS: Folder = PREFABFolder.WaitForChild("Seeds") as Folder;

function getList(PREFABFolder: Folder): Part[] {
    const PREFABS: Part[] = [];
    for (let part of PREFABFolder.GetChildren()) {
        PREFABS.push(part as Part);
    }
    //print(PREFABS);
    return PREFABS;
}

export function getPREFAB(folder: string, targetPREFAB: string): Part[] | undefined {
    let PREFAB: Folder | undefined;
    let targetFolder: Folder | undefined;
    let PREFABSList: Part[] = [];
    switch (folder) {
        case "seeds":
            targetFolder = seeds?.get(targetPREFAB);
            if (targetFolder) PREFABSList = getList(targetFolder);
            return PREFABSList;
        case "upgrades":
        default:
            return;
    }
}

export const seeds: Map<string, Folder> = new Map();
for (let seedFolder of SeedPREFABS.GetChildren()) {
    seeds.set(seedFolder.Name, seedFolder as Folder);
}

